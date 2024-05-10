import ConfigParser from "@webantic/nginx-config-parser"
import { get } from "lodash"
import fs from "fs"
import path from "path"
import { getConf } from "../constant"
import { getRoot } from "../configuration"
import { exec } from "child_process"
import { Now } from "sgridnode/build/main"

export const parser = new ConfigParser()

export function getCurrentConf(path?: string | string[]) {
  const config = parser.readConfigFile(getConf().nginxPath, {
    parseIncludes: false
  })
  if (path) {
    if (typeof path == "string") {
      const arr = path.split(".")
      const getConf = get(config, arr)
      return getConf
    } else if (path instanceof Array) {
      const getConf = get(config, path)
      return getConf
    }
  } else {
    return config
  }
}

export function nginxTest(): Promise<string> {
  return new Promise((resolve) => {
    const test = exec("/usr/sbin/nginx -t", {
      cwd: "/usr/sbin"
    })
    let resu = ""
    test.stdout?.on("data", function (chunk) {
      resu += chunk.toString()
      console.log("stdout ::", chunk.toString())
    })
    test.stderr?.on("data", function (chunk) {
      console.log("stdout ::", chunk.toString())
      resu += chunk.toString()
    })
    test.on("close", function () {
      resolve(resu)
    })
  })
}

export function backupConfAndWriteNew(newConf: string) {
  const rootPath = getRoot()
  const backupConf = parser.toConf(getCurrentConf())
  const dirFiles = fs.readdirSync(path.resolve(rootPath, getConf().historyDir))
  const tdy = Now()
  fs.writeFileSync(
    path.resolve(
      rootPath,
      getConf().historyDir,
      `nginx_${dirFiles.length}_${tdy}.conf`
    ),
    backupConf,
    "utf-8"
  )
  coverConf(newConf)
}

export function reloadNginx() {
  return new Promise((resolve) => {
    const test = exec("/usr/sbin/nginx -s reload", {
      cwd: "/usr/sbin"
    })
    let resu = ""
    test.stdout?.on("data", function (chunk) {
      resu += chunk.toString()
      console.log("stdout ::", chunk.toString())
    })
    test.stderr?.on("data", function (chunk) {
      console.log("stdout ::", chunk.toString())
      resu += chunk.toString()
    })
    test.on("close", function () {
      resolve(resu)
    })
  })
}

export function coverConf(newConf: string) {
  parser.writeConfigFile(getConf().nginxPath, newConf, true)
}
