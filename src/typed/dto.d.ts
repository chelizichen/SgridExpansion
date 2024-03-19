interface NginxExpansionDto {
  upstreamName: string
  server: string[]
  locationName: string
  proxyPass: string
}

interface RunExpandServerDto {
  serverName: string
  ports: string
  fileName: string
}
