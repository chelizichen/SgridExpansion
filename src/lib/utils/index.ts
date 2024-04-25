import yaml from "js-yaml"
import path from "path"
import { readFileSync } from "fs"
import { camelCase } from "lodash"
import dayjs from "dayjs"
import { dates } from "../../constant"
export function parseStorageConf(connectionString: string) {
  // 正则表达式用于找到tcp(host:port)部分
  const tcpRegex = /tcp\(([^)]+)\)/
  const tcpMatch = tcpRegex.exec(connectionString)

  if (!tcpMatch) {
    throw new Error("Invalid connection string: tcp(host:port) not found")
  }

  // 分割host和port
  const hostPort = tcpMatch[1].split(":")
  const host = hostPort[0]
  const port = hostPort[1]

  // 分割用户名和密码
  const credentials = connectionString.split("@")[0]
  const [username, password] = credentials.split(":")

  // 获取数据库名（?之后的参数我们不关心）
  const databaseMatch = connectionString.match(/(\/[^?]*)/)
  const database = databaseMatch ? databaseMatch[0].substring(1) : null

  return {
    username,
    password,
    host,
    port: parseInt(port, 10), // 转换为整数
    database
  }
}

export function parseSimpConf(): SimpConf {
  const isProd = process.env.SGRID_PRODUCTION
  const cwd = process.cwd()
  const rootPath = isProd || cwd
  const fileName = isProd ? "sgridProd.yml" : "sgrid.yml"
  const confPath = path.join(rootPath as string, fileName)
  const content = readFileSync(confPath, "utf-8")
  const conf = yaml.load(content) as SimpConf
  return conf
}

export function dto2tableFields<T = Record<string, unknown>>(dto): T {
  const tableRecord: T = {}
  for (const key in dto) {
    const field_name = key.replace(/([A-Z])/g, "_$1").toLowerCase()
    tableRecord[field_name] = dto[key]
  }
  return tableRecord
}

export function dbRsu2Vo<T>(rsu): T {
  if (rsu === null || rsu === undefined) {
    return {}
  }
  if (rsu instanceof Array) {
    return rsu.map((element) => {
      const tableRecord = {}
      for (const key in element) {
        const field_name = camelCase(key)
        tableRecord[field_name] = element[key]
      }
      return tableRecord
    })
  } else {
    const tableRecord = {}
    for (const key in rsu) {
      const field_name = camelCase(key)
      tableRecord[field_name] = rsu[key]
    }
    return tableRecord
  }
}

export function Now() {
  return dayjs().format(dates.FMT)
}

export function FMT_DAY(v) {
  return dayjs(v).format(dates.FMT)
}

export const Resp = {
  Ok: function (data) {
    return {
      code: 0,
      message: "ok",
      data
    }
  },
  Error: function (code, message, data) {
    return {
      code,
      message,
      data
    }
  }
}
