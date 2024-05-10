import { Resp } from "sgridnode/build/main"

import { validationResult } from "express-validator"
import { existsSync, mkdirSync, readFile, readdir, statSync } from "fs"
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
  const isProd = process.env.SGRID_PRODUCTION
  const cwd = process.cwd()
  const rootPath = isProd || cwd
  const histroyDirPath = path.resolve(rootPath, getConf().historyDir)
  console.log("histroyDirPath", histroyDirPath)

  if (!existsSync(histroyDirPath)) {
    mkdirSync(histroyDirPath)
  }
}

export function getRoot() {
  const isProd = process.env.SGRID_PRODUCTION
  const cwd = process.cwd()
  const rootPath = isProd || cwd
  return rootPath
}

export function getDir(...args: string[]): Error | Promise<string[]> {
  const dir = path.resolve(getRoot(), ...args)
  const stats = statSync(dir)
  if (!stats.isDirectory) {
    return new Error(`path|${dir} | is not a dir`)
  }
  return new Promise((resolve, reject) => {
    readdir(dir, function (err: NodeJS.ErrnoException | null, files: string[]) {
      if (err != null) {
        return reject(err)
      }
      resolve(files)
    })
  })
}

export function getFile(...args: string[]): Error | Promise<string> {
  const file = path.resolve(getRoot(), ...args)
  const stats = statSync(file)
  if (!stats.isFile) {
    return new Error(`path|${file} | is not a file`)
  }
  return new Promise((resolve, reject) => {
    readFile(
      file,
      "utf-8",
      function (error: NodeJS.ErrnoException | null, data: string) {
        if (error != null) {
          return reject(error)
        }
        resolve(data)
      }
    )
  })
}
