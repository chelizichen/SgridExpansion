import { body } from "express-validator"

export const NginxExpansionValidate = [
  body("upstreamName").isString(),
  body("server").isArray(),
  body("locationName").isString(),
  body("proxyPass").isString()
]
