// src/routes/index.ts

import { Router, Express, NextFunction, Request, Response } from "express"
import { constant } from "../constant"
import { Now, Resp } from "../lib/utils"
import { NginxExpansionValidate } from "../validate"
import { getDir, getFile, validateMiddleWare } from "../configuration"
import {
  NginxExpansion,
  backupConfAndWriteNew,
  coverConf,
  getCurrentConf,
  parser,
  reloadNginx
} from "../service"

function routes(ctx: Express): Router {
  const r = Router()
  r.post(
    "/nginxExpansionPreview",
    NginxExpansionValidate,
    validateMiddleWare,
    async function (req: Request, res: Response, next: NextFunction) {
      try {
        const body = req.body as NginxExpansionDto
        const resp = NginxExpansion(body)
        res.send(Resp.Ok(resp))
      } catch (e) {
        next(e)
      }
    }
  )
  r.post(
    "/nginxExpansion",
    NginxExpansionValidate,
    validateMiddleWare,
    async function (req: Request, res: Response, next: NextFunction) {
      try {
        const body = req.body as NginxExpansionDto
        const resp = NginxExpansion(body)
        const streamResp = await backupConfAndWriteNew(resp)
        res.send(Resp.Ok(streamResp))
      } catch (error) {
        next(error)
      }
    }
  )
  r.post("/nginxReload", async function (_, res: Response) {
    const streamResp = await reloadNginx()
    res.status(200).json(Resp.Ok(streamResp))
  })

  r.get("/getProxyList", function (req: Request, res: Response) {
    const conf = getCurrentConf("http")
    const servers = []
    const upstreams = []
    for (const key in conf.server) {
      if (key.startsWith("location")) {
        servers.push({ key, value: conf.server[key] })
      }
    }
    for (const key in conf) {
      if (key.startsWith("upstream")) {
        upstreams.push({
          key: key.replace(/^upstream/, "").trim(),
          value: conf[key]
        })
      }
    }
    res.json(
      Resp.Ok({
        servers,
        upstreams,
        conf: parser.toConf(conf)
      })
    )
  })

  r.get(
    "/getBackupList",
    async function (_: Request, res: Response, next: NextFunction) {
      try {
        const list = await getDir("history")
        if (list instanceof Error) {
          throw list
        }
        res.status(200).json(Resp.Ok(list))
      } catch (e) {
        next(e)
      }
    }
  )

  r.get(
    "/getBackupFile",
    async function (req: Request, res: Response, next: NextFunction) {
      try {
        const fileName = req.query.fileName as unknown as string
        if (fileName !== "origin") {
          const content = await getFile("history", fileName)
          if (content instanceof Error) {
            throw content
          }
          res.status(200).json(Resp.Ok(content))
        } else {
          const content = parser.toConf(getCurrentConf())
          if (content instanceof Error) {
            throw content
          }
          res.status(200).json(Resp.Ok(content))
        }
      } catch (e) {
        next(e)
      }
    }
  )

  r.get(
    "/backup",
    async function (req: Request, res: Response, next: NextFunction) {
      try {
        const fileName = req.query.fileName as unknown as string
        if (fileName !== "origin") {
          const content = await getFile("history", fileName)
          if (content instanceof Error) {
            return res
              .status(200)
              .json(Resp.Error(-1, content.message, content))
          }
          const stdResp = await coverConf(content)
          return res.status(200).json(Resp.Ok(stdResp))
        } else {
          const content = parser.toConf(getCurrentConf())
          const stdResp = await coverConf(content)
          return res.status(200).json(Resp.Ok(stdResp))
        }
      } catch (e) {
        next(e)
      }
    }
  )
  // r.post(
  //   "/runExpandServer",
  //   async function (req: Request, res: Response, next: NextFunction) {
  //     const body = req.body as RunExpandServerDto
  //   }
  // )
  return r
}

export default routes
