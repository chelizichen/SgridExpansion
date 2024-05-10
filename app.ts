import path from "path"
import { NewSgridServerCtx, NewSgridServer } from "sgridnode/build/main"
import { f_env } from "sgridnode/build/lib/constant/index"
import { errorHandler, initHistroyDir } from "./src/configuration"
import SgridController from "./src/routes/nginx"

function boost() {
  const ctx = NewSgridServerCtx()
  initHistroyDir()
  const conf = ctx.get(f_env.ENV_SGRID_CONFIG)
  const servant = path.join("/", conf.server.name.toLowerCase())
  const sgridController = new SgridController(ctx)
  ctx.use(servant, sgridController.router!)
  ctx.use(errorHandler())
  NewSgridServer(ctx)
}

boost()

process.on("uncaughtException", (err) => {
  console.error(err)
})

process.on("unhandledRejection", (reason, p) => {
  console.error(reason, p)
})
