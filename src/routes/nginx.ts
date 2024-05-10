import { Controller, Post, PreHandle, Resp, Get } from "sgridnode/build/main"
import { Express, NextFunction, Request, Response, Router } from "express"
import { NginxExpansionValidate } from "../validate"
import { getDir, getFile, validateMiddleWare } from "../configuration"
import {
  backupConfAndWriteNew,
  nginxTest,
  getCurrentConf,
  parser,
  reloadNginx
} from "../service"

@Controller("/nginx")
class SgridController {
  public ctx: Express
  public router: Router | undefined
  static origin = "origin"
  constructor(ctx: Express) {
    this.ctx = ctx
  }

  @Post("/merge")
  @PreHandle([NginxExpansionValidate, validateMiddleWare])
  async nginxExpansion(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body as NginxExpansionDto
      backupConfAndWriteNew(body.content)
      res.send(Resp.Ok(null))
    } catch (error) {
      next(error)
    }
  }

  @Post("/reload")
  async nginxReload(req: Request, res: Response, next: NextFunction) {
    try {
      const streamResp = await reloadNginx()
      res.status(200).json(Resp.Ok(streamResp))
    } catch (err) {
      next(err)
    }
  }

  @Get("/test")
  async test(req: Request, res: Response, next: NextFunction) {
    try {
      const stdResp = await nginxTest()
      return res.status(200).json(Resp.Ok(stdResp))
    } catch (e) {
      next(e)
    }
  }

  @Get("/getBackupList")
  async getBackupList(req: Request, res: Response, next: NextFunction) {
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

  @Get("/getBackupFile")
  async getBackupFile(req: Request, res: Response, next: NextFunction) {
    try {
      const fileName = req.query.fileName as unknown as string
      if (fileName != SgridController.origin) {
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
}

export default SgridController
