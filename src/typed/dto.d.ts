interface NginxExpansionDto {
  upstreamName: string
  server: string[]
  locationName: string
}

interface RunExpandServerDto {
  serverName: string
  ports: string
  fileName: string
}
