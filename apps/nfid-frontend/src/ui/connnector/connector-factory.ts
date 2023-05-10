import { connectorCache } from "src/ui/connnector/cache"
import { Cacheable, StandardizedToken } from "src/ui/connnector/types"

export abstract class ConnectorFactory<
  N,
  T extends StandardizedToken<N> & Cacheable,
> {
  assetViews: any
  connectorsStorage: Map<N, T>

  constructor(assetViews: any) {
    this.assetViews = assetViews
    this.connectorsStorage = this.toMap(this.assetViews)
  }

  getKeys(): N[] {
    return Array.from(this.connectorsStorage.keys())
  }

  private toMap(connectors: T[]): Map<N, T> {
    const connectorsMap = new Map<N, T>()
    connectors.forEach((connector) => {
      connectorsMap.set(connector.getTokenStandard(), connector)
    })
    return connectorsMap
  }

  private getConnector(key: N) {
    return this.connectorsStorage.get(key)
  }

  async process(key: N, args: any[]) {
    const connector = this.getConnector(key)
    if (!connector) throw Error(key + " not supported")
    const cacheKey = this.getCacheKey(
      key,
      this.getFunctionToCall(connector),
      args,
    )
    return this.processCacheable(
      cacheKey,
      connector,
      this.getFunctionToCall(connector),
      args,
    )
  }

  protected abstract getCacheKey(
    key: N,
    functionToCall: Function,
    args: any[],
  ): string

  protected abstract getFunctionToCall(connector: T): Function

  private async processCacheable(
    cacheKey: string,
    connector: T,
    a: Function,
    args: any[],
  ) {
    const cachedNftConfig = await connectorCache.getItem(cacheKey)
    if (cachedNftConfig) {
      return cachedNftConfig
    }
    const response = await a.apply(connector, args)
    await connectorCache.setItem(cacheKey, response, {
      ttl: connector.getCacheTtl(),
    })
    return response
  }
}
