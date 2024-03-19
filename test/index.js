const ConfigParser = require("@webantic/nginx-config-parser")
const { get, set } = require("lodash")
const parser = new ConfigParser()
const fs = require("fs")
const { cwd } = require("process")
const path = require("path")
const simpConf = {
  nginxPath:
    "/Users/leemulus/GolandProjects/SimpExpansionServer/test/nginx.conf",
  historyDir: "history"
}

function getCurrentConf(path) {
  const config = parser.readConfigFile(simpConf.nginxPath, {
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

// const confStringTest = getCurrentConf("http.server")
// const confArrayTest = getCurrentConf(["http","server"])
// const noneArgsTest = getCurrentConf()

// console.log('confStringTest',confStringTest);
// console.log('confArrayTest',confArrayTest);
// console.log('noneArgsTest',noneArgsTest);

// {
//     upstreamName:"ltsnodeserver",
//     server:[],
//     locationName:"location /ltsnodeserver/"
// }

function createUpstream(upstreamConf) {
  const originConf = getCurrentConf()
  originConf.http[`upstream ${upstreamConf.upstreamName}`] = {
    server: upstreamConf.server
  }
  originConf.http.server[upstreamConf.locationName].proxy_pass =
    `http://${upstreamConf.upstreamName}`
  return parser.toConf(originConf)
}
const body = {
  upstreamName: "up_ltsnodeserver",
  server: [
    "47.98.174.10:8517/ltsnodeserver/",
    "47.98.174.10:8516/ltsnodeserver/"
  ],
  locationName: "location /ltsnodeserver/",
  serverName: "LTSNodeServer"
}
const createResp = createUpstream(body)

console.log("createResp", createResp)

parser.writeConfigFile(
  "/Users/leemulus/GolandProjects/SimpExpansionServer/test/newNginx.conf",
  createResp,
  true
)
