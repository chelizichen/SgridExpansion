import Express, { Router, Request, Response, NextFunction } from "express"
import { RunCommand } from "../service"

function shellRoutes(ctx: Express): Router {
  const r = Router()
  r.get(
    "/shell/input",
    async function (req: Request, res: Response, next: NextFunction) {
      try {
        const { command } = req.query
        res.setHeader("Content-Type", "text/event-stream")
        res.setHeader("Cache-Control", "no-cache")
        res.setHeader("Connection", "keep-alive")
        RunCommand(command as string, res)
      } catch (e) {
        next(e)
      }
    }
  )

  return r
}

export default shellRoutes
