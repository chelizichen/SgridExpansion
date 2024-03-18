import express, { Express } from "express"
import { NewError, constant } from "../constant"
import { parseSimpConf } from "./utils"

export function NewHttpServerCtx(p: string): Express {
  const app = express()
  app.use(express.json())
  const conf = parseSimpConf(p)
  try {
    app.set(constant.SIMP_SERVER_PORT, conf.server.port)
    app.set(constant.SIMP_SERVER_CONF, conf.server)
  } catch (e) {
    NewError(-1, "read storage error")
  }
  return app
}

export function NewSimpHttpServer(ctx: Express) {
  const SIMP_TARGET_PORT = process.env.SIMP_TARGET_PORT
  console.log("SIMP_TARGET_PORT:" + SIMP_TARGET_PORT)
  if (
    SIMP_TARGET_PORT &&
    SIMP_TARGET_PORT != "" &&
    typeof Number(SIMP_TARGET_PORT) == "number"
  ) {
    const port = Number(SIMP_TARGET_PORT)
    ctx.listen(port, function () {
      console.log("child_service : server started at localhost:" + port)
    })
    return
  }
  const port = ctx.get(constant.SIMP_SERVER_PORT)
  ctx.listen(port, function () {
    console.log("main_service :server started at localhost:" + port)
  })
}
