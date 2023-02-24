export type ConnectionDetails = {
  accountId: string
  domain: string
}

export type CachedConnections = {
  [hostname: string]: ConnectionDetails
}
