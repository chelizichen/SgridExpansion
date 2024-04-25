import express, { Express } from "express"
import { NewError, constant } from "../constant"
import { parseSimpConf } from "./utils"
import _ from "lodash"

export function NewSgridServerCtx(): Express {
  const app = express()
  app.use(express.json())
  const conf = parseSimpConf()
  try {
    console.log("conf", JSON.stringify(conf))
    app.set(constant.SGRID_TARGET_PORT, conf.server.port)
    app.set(constant.SGRID_SERVER_CONF, conf.server)
  } catch (e) {
    NewError(-1, "read storage error")
  }
  return app
}

export function NewSgridServer(ctx: Express) {
  const SGRID_TARGET_PORT = process.env.SGRID_TARGET_PORT

  if (SGRID_TARGET_PORT) {
    console.log("SGRID_TARGET_PORT", SGRID_TARGET_PORT)
    const port = Number(SGRID_TARGET_PORT)
    return ctx.listen(port, function () {
      console.log("server started at localhost:" + port)
    })
  }
  const port = ctx.get(constant.SGRID_TARGET_PORT)
  return ctx.listen(port, function () {
    console.log("server started at localhost:" + port)
  })
}

export function NewMainThread() {
  return process.env.SIMP_SERVER_INDEX == "1"
}
