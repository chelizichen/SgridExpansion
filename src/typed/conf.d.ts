interface SimpConf {
  server: {
    name: string
    port: number
    type: string
    staticPath: string
    storage: string
  }
}

// 路由配置接口
interface RouterConf {
  path: string
  router: Router
  meta?: unknown
}

type CamelizeString<T extends PropertyKey> = T extends string
  ? string extends T
    ? string
    : T extends `${infer F}_${infer R}`
      ? `${F}${Capitalize<CamelizeString<R>>}`
      : T
  : T

type Camelize<T> = { [K in keyof T as CamelizeString<K>]: T[K] }

type UnderlineCase<Str extends string> =
  Str extends `${infer First}${infer Upper}${infer Rest}`
    ? `${UnderlineChar<First>}${UnderlineChar<Upper>}${UnderlineCase<Rest>}`
    : Str
