const ConfigParser = require("@webantic/nginx-config-parser");
const { get, set } = require("lodash");
const parser = new ConfigParser();
const fs = require('fs');
const { cwd } = require("process");
const path = require("path");
const simpConf = {
  nginxPath: "/Users/leemulus/GolandProjects/SimpExpansionServer/nginx.conf",
  historyDir: "history",
};

function getCurrentConf(path) {
  const config = parser.readConfigFile(simpConf.nginxPath, {
    parseIncludes: false,
  });
  if (path) {
    if (typeof path == "string") {
      const arr = path.split(".");
      const getConf = get(config, arr);
      return getConf;
    } else if (path instanceof Array) {
      const getConf = get(config, path);
      return getConf;
    }
  } else {
    return config;
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
  const originConf = getCurrentConf();
  originConf.http[`upstream ${upstreamConf.upstreamName}`] = {
    server:upstreamConf.server
  };
  originConf.http.server[upstreamConf.locationName].proxy_pass = `http://${upstreamConf.upstreamName}`
return parser.toConf(originConf)
}

const createResp = createUpstream({
  upstreamName: "ltsnodeserver",
  server: ["127.0.0.5812:8511", "127.0.0.5812:8512", "127.0.0.5812:8513"],
  locationName: "location /ltsnodeserver/",
});

console.log('createResp',createResp);
const root = cwd()

const dirFiles = fs.readdirSync(path.resolve(root,'history'))
fs.writeFileSync(path.resolve(root,simpConf.historyDir,`nginx_${dirFiles.length}.conf`),createResp,'utf-8')
parser.writeConfigFile('/Users/leemulus/GolandProjects/SimpExpansionServer/test/newNginx.conf', createResp, true)
