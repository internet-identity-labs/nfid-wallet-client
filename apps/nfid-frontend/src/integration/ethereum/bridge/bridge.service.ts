import { SignIdentity } from "@dfinity/agent"
import { TokenTransfer } from "@wormhole-foundation/sdk-connect"
import { Wormhole, wormhole } from "@wormhole-foundation/sdk"
import evm from "@wormhole-foundation/sdk/evm"
import type { EvmChains } from "@wormhole-foundation/sdk-evm"
import type { EvmUnsignedTransaction } from "@wormhole-foundation/sdk-evm"
import type {
  SignAndSendSigner,
  TxHash,
  UnsignedTransaction,
} from "@wormhole-foundation/sdk-definitions"
import { Contract, Interface, JsonRpcProvider, ZeroAddress } from "ethers"

import { ETH_DECIMALS, INFURA_API_KEY } from "@nfid/integration/token/constants"
import {
  FORMATTED_CHAINS,
  BRIDGE_CHAIN_ID,
  BRIDGE_SCAN_API,
  BRIDGE_TO_CHAIN_ID,
  TOKEN_BRIDGE_ADDRESS,
  ATTESTATION_TIMEOUT,
} from "./constants"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import {
  BridgeChain,
  BridgeTransaction,
  ChainMode,
  EstimatedBridge,
  PendingBridge,
} from "./types"
import { TOKEN_BRIDGE_ABI } from "./abi"
import { ethereumService } from "../eth/ethereum.service"
import { EthSignTransactionRequest } from "frontend/integration/bitcoin/idl/chain-fusion-signer.d"
import { chainFusionSignerService } from "frontend/integration/bitcoin/services/chain-fusion-signer.service"

export class BridgeService {
  private wh: Wormhole<ChainMode.MAINNET> | null = null
  private readonly providers = new Map<ChainId, JsonRpcProvider>([
    [
      ChainId.ETH,
      new JsonRpcProvider(`https://mainnet.infura.io/v3/${INFURA_API_KEY}`),
    ],
    [
      ChainId.POL,
      new JsonRpcProvider(
        `https://polygon-mainnet.infura.io/v3/${INFURA_API_KEY}`,
      ),
    ],
    [
      ChainId.BASE,
      new JsonRpcProvider(
        `https://base-mainnet.infura.io/v3/${INFURA_API_KEY}`,
      ),
    ],
    [
      ChainId.ARB,
      new JsonRpcProvider(
        `https://arbitrum-mainnet.infura.io/v3/${INFURA_API_KEY}`,
      ),
    ],
  ])

  private async init(): Promise<void> {
    this.wh = await wormhole(ChainMode.MAINNET, [evm], {
      chains: {
        Ethereum: { rpc: `https://mainnet.infura.io/v3/${INFURA_API_KEY}` },
        Polygon: {
          rpc: `https://polygon-mainnet.infura.io/v3/${INFURA_API_KEY}`,
        },
        Base: { rpc: `https://base-mainnet.infura.io/v3/${INFURA_API_KEY}` },
        Arbitrum: {
          rpc: `https://arbitrum-mainnet.infura.io/v3/${INFURA_API_KEY}`,
        },
      },
    })
  }

  private async getWh(): Promise<Wormhole<ChainMode.MAINNET>> {
    if (!this.wh) await this.init()
    return this.wh!
  }

  private async getAddress(identity: SignIdentity): Promise<string> {
    return ethereumService.getAddress(identity)
  }

  public async getBridgeQuote(
    fromChainId: ChainId,
    toChainId: ChainId,
    tokenAddress: string | "native",
    amount: bigint,
  ) {
    const wh = await this.getWh()
    const fromChain = this.formatChain(fromChainId)
    const toChain = this.formatChain(toChainId)

    const token = Wormhole.tokenId(fromChain, tokenAddress)

    return TokenTransfer.quoteTransfer(
      wh,
      wh.getChain(fromChain),
      wh.getChain(toChain),
      {
        protocol: "TokenBridge",
        token,
        amount,
      },
    )
  }

  public async estimateBridge(
    fromChainId: ChainId,
    toChainId: ChainId,
    tokenAddress: string | "native",
    amount: string,
    decimals: number,
  ): Promise<EstimatedBridge> {
    const fromProvider = this.providers.get(fromChainId)!
    const toProvider = this.providers.get(toChainId)!
    const value = BigInt(Number(amount) * 10 ** decimals)

    const [fromFeeData, toFeeData, quote] = await Promise.all([
      fromProvider.getFeeData(),
      toProvider.getFeeData(),
      this.getBridgeQuote(fromChainId, toChainId, tokenAddress, value),
    ])

    const bridgeCost =
      BigInt(200_000) * (fromFeeData.maxFeePerGas ?? BigInt(50_000_000_000))
    const sourceCost =
      tokenAddress === "native" ? bridgeCost + value : bridgeCost
    const redeemCost =
      BigInt(250_000) * (toFeeData.maxFeePerGas ?? BigInt(50_000_000_000))

    return {
      sourceCost: `${Number(sourceCost) / 10 ** ETH_DECIMALS} ${fromChainId === ChainId.POL ? "POL" : "ETH"}`,
      redeemCost: `${Number(redeemCost) / 10 ** ETH_DECIMALS} ${toChainId === ChainId.POL ? "POL" : "ETH"}`,
      time: quote.eta ? `${quote.eta / 60000} minutes` : undefined,
    }
  }

  private buildSigner(
    identity: SignIdentity,
    address: string,
    chainId: ChainId,
  ): SignAndSendSigner<ChainMode.MAINNET, EvmChains> {
    const provider = this.providers.get(chainId)
    if (!provider) throw new Error(`No provider for chain: ${chainId}`)
    const chainName = this.formatChain(chainId) as EvmChains

    return {
      chain: () => chainName,
      address: () => address,
      signAndSend: async (
        txs: UnsignedTransaction<ChainMode.MAINNET, EvmChains>[],
      ): Promise<TxHash[]> => {
        const hashes: TxHash[] = []
        for (const tx of txs) {
          const { transaction } = tx as EvmUnsignedTransaction<
            ChainMode.MAINNET,
            EvmChains
          >
          const [feeData, nonce] = await Promise.all([
            provider.getFeeData(),
            provider.getTransactionCount(address),
          ])
          const maxPriorityFeePerGas =
            feeData.maxPriorityFeePerGas ?? BigInt(2_000_000_000)
          const maxFeePerGas =
            feeData.maxFeePerGas ?? maxPriorityFeePerGas + BigInt(5_000_000_000)

          const request: EthSignTransactionRequest = {
            to: transaction.to as string,
            value: BigInt(transaction.value ?? 0),
            data: transaction.data ? [transaction.data as string] : [],
            nonce: BigInt(nonce),
            gas: BigInt(transaction.gasLimit ?? 500_000),
            max_priority_fee_per_gas: maxPriorityFeePerGas,
            max_fee_per_gas: maxFeePerGas,
            chain_id: BigInt(chainId),
          }

          const signedTx = await chainFusionSignerService.ethSignTransaction(
            identity,
            request,
          )
          const response = await provider.broadcastTransaction(signedTx)
          const receipt = await response.wait()
          if (!receipt) throw new Error("No receipt for transaction")
          hashes.push(receipt.hash)
        }
        return hashes
      },
    }
  }

  public async getSupportedDestinationChains(
    fromChainId: ChainId,
    tokenAddress: string | "native",
  ): Promise<ChainId[]> {
    const supportedChains = [...this.providers.keys()].filter(
      (c) => c !== fromChainId,
    )

    if (tokenAddress === "native") return supportedChains

    const fromWormholeChainId = BRIDGE_CHAIN_ID[fromChainId]
    const tokenBytes32 =
      "0x" + tokenAddress.replace("0x", "").toLowerCase().padStart(64, "0")

    const results = await Promise.all(
      supportedChains.map(async (chainId) => {
        try {
          const tokenBridge = new Contract(
            TOKEN_BRIDGE_ADDRESS[chainId],
            new Interface(TOKEN_BRIDGE_ABI),
            this.providers.get(chainId)!,
          )
          const wrapped = await tokenBridge.wrappedAsset(
            fromWormholeChainId,
            tokenBytes32,
          )
          return wrapped !== ZeroAddress ? chainId : null
        } catch {
          return null
        }
      }),
    )

    return results.filter((c): c is ChainId => c !== null)
  }

  private async validateTransaction(
    address: string,
    fromChainId: ChainId,
    toChainId: ChainId,
    tokenAddress: string | "native",
    amount: bigint,
  ): Promise<void> {
    const fromProvider = this.providers.get(fromChainId)!
    const toProvider = this.providers.get(toChainId)!

    const [fromFeeData, fromBalance, toFeeData, toBalance] = await Promise.all([
      fromProvider.getFeeData(),
      fromProvider.getBalance(address),
      toProvider.getFeeData(),
      toProvider.getBalance(address),
    ])

    // Estimate gas cost for initiateTransfer on the source chain (~200k gas)
    const bridgeCost =
      BigInt(200_000) * (fromFeeData.maxFeePerGas ?? BigInt(50_000_000_000))
    const sourceCost =
      tokenAddress === "native" ? bridgeCost + amount : bridgeCost
    if (fromBalance < sourceCost) {
      throw new Error(
        `Insufficient funds on source chain. Need ~${sourceCost} wei, have ${fromBalance} wei.`,
      )
    }

    // Estimate gas cost for completeTransfer on the destination chain (~250k gas)
    const redeemCost =
      BigInt(250_000) * (toFeeData.maxFeePerGas ?? BigInt(50_000_000_000))
    if (toBalance < redeemCost) {
      throw new Error(
        `Insufficient funds on destination chain to pay redemption gas. Need ~${redeemCost} wei, have ${toBalance} wei.`,
      )
    }
  }

  public async bridge(
    identity: SignIdentity,
    fromChainId: ChainId,
    toChainId: ChainId,
    tokenAddress: string | "native",
    amount: string,
    decimals: number,
  ): Promise<TxHash[]> {
    const wh = await this.getWh()
    const address = await this.getAddress(identity)
    const value = BigInt(Number(amount) * 10 ** decimals)

    await this.validateTransaction(
      address,
      fromChainId,
      toChainId,
      tokenAddress,
      value,
    )

    const fromChain = this.formatChain(fromChainId)
    const toChain = this.formatChain(toChainId)

    const token = Wormhole.tokenId(fromChain, tokenAddress)
    const from = Wormhole.chainAddress(fromChain, address)
    const to = Wormhole.chainAddress(toChain, address)

    const tokenTransfer = await wh.tokenTransfer(
      token,
      value,
      from,
      to,
      "TokenBridge",
    )
    await tokenTransfer.initiateTransfer(
      this.buildSigner(identity, address, fromChainId),
    )

    await tokenTransfer.fetchAttestation(ATTESTATION_TIMEOUT)

    return tokenTransfer.completeTransfer(
      this.buildSigner(identity, address, toChainId),
    )
  }

  public async getPendingBridges(address: string): Promise<PendingBridge[]> {
    const url = `${BRIDGE_SCAN_API}operations?address=${address}&page=0&pageSize=50`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Wormhole scan API error: ${res.status}`)
    const json = await res.json()

    return (json.operations ?? [])
      .filter((op: BridgeTransaction) => op.status === "ongoing")
      .map((op: BridgeTransaction) => ({
        sourceTxHash: op.sourceChain?.transaction?.txHash,
        fromChainId: BRIDGE_TO_CHAIN_ID[op.sourceChain?.chainId ?? -1],
        toChainId: BRIDGE_TO_CHAIN_ID[op.targetChain?.chainId ?? -1],
      }))
      .filter(
        (p: PendingBridge) => p.sourceTxHash && p.fromChainId && p.toChainId,
      )
  }

  public async completePendingBridge(
    identity: SignIdentity,
    pending: PendingBridge,
  ): Promise<TxHash[]> {
    const wh = await this.getWh()
    const address = await this.getAddress(identity)
    const fromChain = this.formatChain(pending.fromChainId)

    const tokenTransfer = await TokenTransfer.from(wh, {
      chain: fromChain,
      txid: pending.sourceTxHash,
    })

    await tokenTransfer.fetchAttestation(ATTESTATION_TIMEOUT)
    return tokenTransfer.completeTransfer(
      this.buildSigner(identity, address, pending.toChainId),
    )
  }

  private formatChain(chainId: ChainId): BridgeChain {
    const name = FORMATTED_CHAINS[chainId]
    if (!name) throw new Error(`Chain ${chainId} is not supported for bridging`)
    return name
  }
}

export const bridgeService = new BridgeService()
