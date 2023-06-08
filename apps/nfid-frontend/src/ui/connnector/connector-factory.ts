import { StandardizedToken } from "./types"

export abstract class ConnectorFactory<N, T extends StandardizedToken<N>> {
  connectors: any
  connectorsStorage: Map<N, T>

  constructor(connectors: any) {
    this.connectors = connectors
    this.connectorsStorage = this.toMap(this.connectors)
  }

  getKeys(): N[] {
    return Array.from(this.connectorsStorage.keys())
  }

  async process(key: N, args: any[]) {
    const connector = this.getConnector(key)
    if (!connector) throw Error(key + " not supported")

    return await this.getFunctionToCall(connector).apply(connector, args)
  }

  protected abstract getFunctionToCall(connector: T): Function

  private toMap(connectors: T[]): Map<N, T> {
    const connectorsMap = new Map<N, T>()
    connectors.forEach((connector) => {
      console.log({ connector })
      connectorsMap.set(connector.getTokenStandard(), connector)
    })
    return connectorsMap
  }

  private getConnector(key: N) {
    return this.connectorsStorage.get(key)
  }
}
