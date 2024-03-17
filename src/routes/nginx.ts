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
        upstreams.push({ key, value: conf[key] })
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
