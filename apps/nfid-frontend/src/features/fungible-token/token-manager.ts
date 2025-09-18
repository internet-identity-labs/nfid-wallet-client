import { Principal } from "@dfinity/principal"
import { authState } from "@nfid/integration"
import { BTC_NATIVE_ID, ETH_NATIVE_ID } from "@nfid/integration/token/constants"
import { FT } from "frontend/integration/ft/ft"

interface TokenManagerState {
  initializedTokens: Map<string, FT>
  initializationPromises: Map<string, Promise<FT>>
  isInitializing: boolean
  globalTokenCache: Map<string, FT>
}

class TokenManager {
  private state: TokenManagerState = {
    initializedTokens: new Map(),
    initializationPromises: new Map(),
    isInitializing: false,
    globalTokenCache: new Map(),
  }

  private getTokenKey(token: FT): string {
    return `${token.getTokenAddress()}_${token.getTokenIndex() || "no-index"}`
  }

  async initializeToken(
    token: FT,
    isBtcAddressLoading: boolean = false,
    isEthAddressLoading: boolean = false,
  ): Promise<FT> {
    const key = this.getTokenKey(token)

    if (this.state.initializedTokens.has(key)) {
      return this.state.initializedTokens.get(key)!
    }

    if (this.state.initializationPromises.has(key)) {
      return this.state.initializationPromises.get(key)!
    }

    if (token.isInited()) {
      this.state.initializedTokens.set(key, token)
      return token
    }

    if (token.getTokenAddress() === BTC_NATIVE_ID && isBtcAddressLoading) {
      return token
    }
    if (token.getTokenAddress() === ETH_NATIVE_ID && isEthAddressLoading) {
      return token
    }

    const initPromise = this.performInitialization(token, key)
    this.state.initializationPromises.set(key, initPromise)

    try {
      const initializedToken = await initPromise
      this.state.initializedTokens.set(key, initializedToken)
      this.state.initializationPromises.delete(key)
      return initializedToken
    } catch (error) {
      this.state.initializationPromises.delete(key)
      throw error
    }
  }

  private async performInitialization(token: FT, key: string): Promise<FT> {
    const { publicKey } = authState.getUserIdData()
    return await token.init(Principal.fromText(publicKey))
  }

  async initializeTokens(
    tokens: FT[],
    isBtcAddressLoading: boolean = false,
    isEthAddressLoading: boolean = false,
  ): Promise<FT[]> {
    if (this.state.isInitializing) {
      await this.waitForCurrentInitialization()
    }

    this.state.isInitializing = true

    try {
      const initPromises = tokens.map((token) =>
        this.initializeToken(token, isBtcAddressLoading, isEthAddressLoading),
      )

      return await Promise.all(initPromises)
    } finally {
      this.state.isInitializing = false
    }
  }

  private async waitForCurrentInitialization(): Promise<void> {
    while (this.state.isInitializing) {
      await new Promise((resolve) => setTimeout(resolve, 10))
    }
  }

  getInitializedToken(token: FT): FT | undefined {
    const key = this.getTokenKey(token)
    return this.state.initializedTokens.get(key)
  }

  isTokenInitialized(token: FT): boolean {
    const key = this.getTokenKey(token)
    return this.state.initializedTokens.has(key) || token.isInited()
  }

  clearCache(): void {
    this.state.initializedTokens.clear()
    this.state.initializationPromises.clear()
    this.state.isInitializing = false
  }

  cacheTokens(tokens: FT[]): void {
    tokens.forEach((token) => {
      const key = this.getTokenKey(token)
      this.state.globalTokenCache.set(key, token)
    })
  }

  getCachedTokens(tokens: FT[]): FT[] {
    return tokens.map((token) => {
      const key = this.getTokenKey(token)
      const cachedToken = this.state.globalTokenCache.get(key)

      if (cachedToken) {
        return cachedToken
      }

      this.state.globalTokenCache.set(key, token)
      return token
    })
  }

  getCachedToken(token: FT): FT | undefined {
    const key = this.getTokenKey(token)
    return this.state.globalTokenCache.get(key)
  }

  clearGlobalCache(): void {
    this.state.globalTokenCache.clear()
    this.state.initializedTokens.clear()
    this.state.initializationPromises.clear()
    this.state.isInitializing = false
  }
}

export const tokenManager = new TokenManager()
