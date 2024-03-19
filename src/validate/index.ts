import { body, check, query } from "express-validator"

// {
//     upstreamName:"ltsnodeserver",
//     server:[],
//     locationName:"location /ltsnodeserver/"
// }

export const NginxExpansionValidate = [
  body("upstreamName").isString(),
  body("server").isArray(),
  body("locationName").isString(),
  body("proxyPass").isString()
]
