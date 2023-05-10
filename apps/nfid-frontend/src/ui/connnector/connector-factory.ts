import {Cacheable, StandardizedToken} from "src/ui/connnector/types";
import {connectorCache} from "src/ui/connnector/cache";

export abstract class ConnectorFactory<N,T extends StandardizedToken<N> & Cacheable> {
  assetViews: any
  connectorsStorage: Map<N, T>

  constructor(assetViews: any) {
    this.assetViews = assetViews
    this.connectorsStorage = this.toMap(this.assetViews)
  }

   getKeys(): N[] {
    return Array.from(this.connectorsStorage.keys())
  }

  toMap(
    connectors: T[],
  ): Map<N, T> {
    const connectorsMap = new Map<
      N,
      T
    >()
    connectors.forEach((connector) => {
      connectorsMap.set(connector.getTokenStandard(), connector)
    })
    return connectorsMap
  }

  getConnector(key: N) {
    return this.connectorsStorage.get(key)
  }

  async process(key: N, args: any[]) {
    const connector = this.getConnector(key)
    if (!connector)
      throw Error(key + " not supported")
    const cacheKey = this.getCacheKey(key, this.getFunctionToCall(connector), args)
    return this.processCacheable(cacheKey, connector, this.getFunctionToCall(connector), args)
  }

  abstract getCacheKey(key: N, functionToCall: Function, args: any[]) : string

  abstract getFunctionToCall(connector: T) : Function

  async processCacheable(cacheKey: string, connector: T, a: Function, args: any[]) {
    const cachedNftConfig = await connectorCache.getItem(
      cacheKey,
    )
    if (cachedNftConfig) {
      return cachedNftConfig
    }
    const response = await a.apply(connector,args)
    await connectorCache.setItem(cacheKey, response, {
      ttl: connector.getCacheTtl(),
    })
    return response
  }

}
