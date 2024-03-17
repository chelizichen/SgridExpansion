// src/routes/index.ts

import e, { Router, Express, NextFunction, Request, Response } from "express"
import { constant } from "../constant"
import { Now, Resp } from "../lib/utils"
import { NginxExpansionValidate } from "../validate"
import { validateMiddleWare } from "../configuration"
import {
  NginxExpansion,
  backupConfAndWriteNew,
  getCurrentConf,
  parser
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
  return r
}

export default routes
