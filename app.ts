import path from "path"
import { constant } from "./src/constant"
import { NewSgridServerCtx, NewSgridServer } from "./src/lib"
import { errorHandler, initHistroyDir } from "./src/configuration"
import SgridController from "./src/routes/nginx"

function boost() {
  const ctx = NewSgridServerCtx()
  initHistroyDir()
  const conf = ctx.get(constant.SGRID_SERVER_CONF) as SimpConf["server"]
  const servant = path.join("/", conf.name.toLowerCase())
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
