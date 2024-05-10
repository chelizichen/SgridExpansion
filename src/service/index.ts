import { Now } from "sgridnode/build/main"
import ConfigParser from "@webantic/nginx-config-parser"
import { get } from "lodash"
import fs from "fs"
import path from "path"
import { getConf } from "../constant"
import { getRoot } from "../configuration"
import { exec } from "child_process"
export const parser = new ConfigParser()

export function NginxExpansion(upstreamConf: NginxExpansionDto) {
  const originConf = getCurrentConf()
  originConf.http[`upstream ${upstreamConf.upstreamName}`] = {
    server: upstreamConf.server
  }
  originConf.http.server[upstreamConf.locationName].proxy_pass =
    upstreamConf.proxyPass
  return parser.toConf(originConf)
}

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

export function coverConf(newConf: string): Promise<string> {
  return new Promise((resolve) => {
    parser.writeConfigFile(getConf().nginxPath, newConf, true)
    const test = exec("nginx -t")
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
  return new Promise((resolve, reject) => {
    try {
      const rootPath = getRoot()
      const backupConf = parser.toConf(getCurrentConf())
      const dirFiles = fs.readdirSync(
        path.resolve(rootPath, getConf().historyDir)
      )
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
      coverConf(newConf).then((res) => {
        resolve(res)
      })
    } catch (e) {
      reject(e)
    }
  })
}

export function reloadNginx() {
  return new Promise((resolve) => {
    const test = exec("nginx -s reload")
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
