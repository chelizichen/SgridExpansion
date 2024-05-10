import { body } from "express-validator"

export const NginxExpansionValidate = [body("content").isString()]
