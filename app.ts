import path from "path"
import { constant } from "./src/constant"
import { NewHttpServerCtx, NewSimpHttpServer } from "./src/lib"
import { errorHandler, initHistroyDir } from "./src/configuration"
import NginxRoutes from "./src/routes/nginx"
import ShellRoutes from "./src/routes/shell"

const ctx = NewHttpServerCtx("simp.yaml")
initHistroyDir()
const conf = ctx.get(constant.SIMP_SERVER_CONF) as SimpConf["server"]
const servant = path.join("/", conf.name.toLowerCase())

ctx.use(servant, NginxRoutes(ctx))
ctx.use(servant, ShellRoutes(ctx))
// 错误处理中间件
ctx.use(errorHandler())
NewSimpHttpServer(ctx)

process.on("uncaughtException", (err) => {
  console.error(err)
})

process.on("unhandledRejection", (reason, p) => {
  console.error(reason, p)
})
