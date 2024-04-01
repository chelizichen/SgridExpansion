import { spawn } from "child_process"
import Express, { Router, Request, Response, NextFunction } from "express"

function shellRoutes(ctx: Express): Router {
  const r = Router()
  let activeShell = null
  r.get(
    "/shell/input",
    async function (req: Request, res: Response, next: NextFunction) {
      try {
        const { command } = req.query
        console.log("command", command)
        res.setHeader("Content-Type", "text/event-stream")
        res.setHeader("Cache-Control", "no-cache")
        res.setHeader("Connection", "keep-alive")
        // 检查是否有已经运行的 shell 进程
        // 创建新的 shell 进程
        const shell = spawn("sh", ["-c", command as string])

        // 保存当前的 shell 进程
        activeShell = shell

        // 监听 shell 进程的标准输出
        shell.stdout.on("data", (chunk) => {
          res.write(`data:${JSON.stringify({ message: chunk.toString() })}\n\n`)
        })

        // 监听 shell 进程的标准错误输出
        shell.stderr.on("data", (chunk) => {
          res.write(`data:${JSON.stringify({ message: chunk.toString() })}\n\n`)
        })

        // 监听 shell 进程的关闭事件
        shell.on("close", (code) => {
          res.end(`\nShell process exited with code ${code}`)
          activeShell = null // 清除当前 shell 进程
        })
      } catch (e) {
        next(e)
      }
    }
  )

  return r
}

export default shellRoutes
