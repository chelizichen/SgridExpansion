import { Resp } from "../lib/utils"
import { validationResult } from "express-validator"
import { existsSync, mkdirSync, readdirSync } from "fs"
import path from "path"
import { getConf } from "../constant"

export function errorHandler() {
  return (err, req, res, next) => {
    console.log("err", err)
    res.json(Resp.Error(-1, err.message, null))
  }
}

export function validateMiddleWare(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(200).json(Resp.Error(-1, "validateError", errors.array()))
  }
  next()
}

export function initHistroyDir() {
  const isProd = process.env.SIMP_PRODUCTION === "Yes"
  const cwd = process.cwd()
  const rootPath = (isProd ? process.env.SIMP_SERVER_PATH : cwd) as string
  const histroyDirPath = path.resolve(rootPath, getConf().historyDir)
  if (!existsSync(histroyDirPath)) {
    mkdirSync(histroyDirPath)
  }
}
