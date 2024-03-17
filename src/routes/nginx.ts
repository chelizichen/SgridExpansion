// src/routes/index.ts

import e, { Router, Express, NextFunction, Request, Response } from "express"
import { constant } from "../constant"
import { Now, Resp } from "../lib/utils"
import { NginxExpansionValidate } from "../validate"
import { validateMiddleWare } from "../configuration"
import { NginxExpansion, backupConfAndWriteNew } from "../service"

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
  return r
}

export default routes
