jest.mock("packages/integration/src/lib/authentication/storage", () => ({
  authStorage: { get: jest.fn() },
}))

jest.mock("@nfid/integration", () => ({
  authState: { get: jest.fn() },
  getAnonymousDelegation: jest.fn(),
  getGlobalDelegation: jest.fn(),
}))

jest.mock("frontend/features/authentication/services", () => ({
  getLegacyThirdPartyAuthSession: jest.fn(),
}))

jest.mock(
  "frontend/integration/identity/delegation-chain-from-delegation",
  () => ({
    delegationChainFromDelegation: jest.fn(),
  }),
)

jest.mock("../../account.service", () => ({
  INDEX_DB_CONNECTED_ACCOUNTS_KEY: (origin: string) =>
    `${origin}-connectedAccounts`,
}))

jest.mock("../../call-canister.service", () => ({
  callCanisterService: { call: jest.fn() },
}))

jest.mock("../../canister-calls-helpers/default", () => ({
  getDefaultMetadata: jest.fn(),
}))

jest.mock("../../canister-calls-helpers/icrc1-transfer", () => ({
  getIcrc1TransferMetadata: jest.fn(),
}))

jest.mock("../../canister-calls-helpers/icrc2-approve", () => ({
  getMetadataICRC2Approve: jest.fn(),
}))

jest.mock("../../canister-calls-helpers/ledger-transfer", () => ({
  getLedgerTransferMetadata: jest.fn(),
}))

jest.mock("../../consent-message.service", () => ({
  consentMessageService: { getConsentMessage: jest.fn() },
}))

jest.mock("../../interface-factory.service", () => ({
  CANDID_UI_CANISTER: "a4gq6-oaaaa-aaaab-qaa4q-cai",
  interfaceFactoryService: { getInterfaceFactory: jest.fn() },
}))

import { IDL } from "@icp-sdk/core/candid"
import { Ed25519KeyIdentity, DelegationIdentity } from "@icp-sdk/core/identity"

import {
  authState,
  getAnonymousDelegation,
  getGlobalDelegation,
} from "@nfid/integration"
import { getLegacyThirdPartyAuthSession } from "frontend/features/authentication/services"
import { delegationChainFromDelegation } from "frontend/integration/identity/delegation-chain-from-delegation"

import { authStorage } from "packages/integration/src/lib/authentication/storage"

import { icrc49CallCanisterMethodService as service } from "./icrc49-call-canister-method.service"
import { callCanisterService } from "../../call-canister.service"
import { getDefaultMetadata } from "../../canister-calls-helpers/default"
import { getIcrc1TransferMetadata } from "../../canister-calls-helpers/icrc1-transfer"
import { getMetadataICRC2Approve } from "../../canister-calls-helpers/icrc2-approve"
import { getLedgerTransferMetadata } from "../../canister-calls-helpers/ledger-transfer"
import { consentMessageService } from "../../consent-message.service"
import { interfaceFactoryService } from "../../interface-factory.service"
import { Account, AccountType, RPCMessage } from "../../../type"

const ORIGIN = "https://dapp.example"

const buildAccount = (overrides: Partial<Account> = {}): Account => ({
  id: 1,
  displayName: "Account 1",
  principal: "2vxsx-fae",
  subaccount: "",
  type: AccountType.GLOBAL,
  origin: ORIGIN,
  ...overrides,
})

describe("Icrc49CallCanisterMethodService", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("getMethod / requiresAuthentication", () => {
    it("should identify itself as icrc49_call_canister and require authentication", () => {
      expect(service.getMethod()).toBe("icrc49_call_canister")
      expect(service.requiresAuthentication()).toBe(true)
    })
  })

  describe("getSender (private)", () => {
    const getSender = (service as any).getSender.bind(service)

    it("should throw when there are no connected accounts stored", async () => {
      (authStorage.get as jest.Mock).mockResolvedValue(null)

      await expect(getSender(ORIGIN, "2vxsx-fae")).rejects.toThrow(
        "We couldn't find connected account",
      )
    })

    it("should throw when the sender principal is not among connected accounts", async () => {
      (authStorage.get as jest.Mock).mockResolvedValue(
        JSON.stringify([buildAccount({ principal: "someone-else" })]),
      )

      await expect(getSender(ORIGIN, "2vxsx-fae")).rejects.toThrow(
        "Sender principal is not one of connected accounts.",
      )
    })

    it("should return the matching connected account", async () => {
      const account = buildAccount()
      ;(authStorage.get as jest.Mock).mockResolvedValue(
        JSON.stringify([buildAccount({ principal: "other" }), account]),
      )

      const result = await getSender(ORIGIN, "2vxsx-fae")

      expect(result).toEqual(account)
    })
  })

  describe("getIdentity (private)", () => {
    const getIdentity = (service as any).getIdentity.bind(service)
    const dto = { canisterId: "aaaaa-aa" } as any

    it("should resolve a global delegation for GLOBAL accounts", async () => {
      const delegationIdentity = { fake: "global-delegation" }
      ;(authState.get as jest.Mock).mockReturnValue({
        delegationIdentity: "root-delegation",
      })
      ;(getGlobalDelegation as jest.Mock).mockResolvedValue(delegationIdentity)

      const result = await getIdentity(
        dto,
        buildAccount({ type: AccountType.GLOBAL }),
      )

      expect(getGlobalDelegation).toHaveBeenCalledWith("root-delegation", [
        "a4gq6-oaaaa-aaaab-qaa4q-cai",
        "aaaaa-aa",
      ])
      expect(result).toBe(delegationIdentity)
    })

    it("should derive a session delegation for SESSION accounts", async () => {
      const account = buildAccount({
        type: AccountType.SESSION,
        derivationOrigin: "https://derivation.example",
      })
      ;(getAnonymousDelegation as jest.Mock).mockResolvedValue(
        "delegation-chain",
      )
      ;(authState.get as jest.Mock).mockReturnValue({
        delegationIdentity: "root-delegation",
      })
      const fromDelegationSpy = jest
        .spyOn(DelegationIdentity, "fromDelegation")
        .mockReturnValue("session-identity" as any)

      const result = await getIdentity(dto, account)

      expect(getAnonymousDelegation).toHaveBeenCalledWith(
        "https://derivation.example",
        expect.any(Uint8Array),
        "root-delegation",
      )
      expect(fromDelegationSpy).toHaveBeenCalledWith(
        expect.any(Ed25519KeyIdentity),
        "delegation-chain",
      )
      expect(result).toBe("session-identity")

      fromDelegationSpy.mockRestore()
    })

    it("should fall back to the account origin for SESSION_WITHOUT_DERIVATION accounts with no derivationOrigin", async () => {
      const account = buildAccount({
        type: AccountType.SESSION_WITHOUT_DERIVATION,
        derivationOrigin: undefined,
        origin: "https://account-origin.example",
      })
      ;(getAnonymousDelegation as jest.Mock).mockResolvedValue(
        "delegation-chain",
      )
      ;(authState.get as jest.Mock).mockReturnValue({
        delegationIdentity: "root-delegation",
      })
      const fromDelegationSpy = jest
        .spyOn(DelegationIdentity, "fromDelegation")
        .mockReturnValue("session-identity" as any)

      await getIdentity(dto, account)

      expect(getAnonymousDelegation).toHaveBeenCalledWith(
        "https://account-origin.example",
        expect.any(Uint8Array),
        "root-delegation",
      )

      fromDelegationSpy.mockRestore()
    })

    it("should build a legacy anonymous session for ANONYMOUS_LEGACY accounts", async () => {
      const account = buildAccount({
        type: AccountType.ANONYMOUS_LEGACY,
        derivationOrigin: "https://derivation.example",
      })
      ;(getLegacyThirdPartyAuthSession as jest.Mock).mockResolvedValue(
        "legacy-session",
      )
      ;(delegationChainFromDelegation as jest.Mock).mockReturnValue(
        "delegation-chain",
      )
      const fromDelegationSpy = jest
        .spyOn(DelegationIdentity, "fromDelegation")
        .mockReturnValue("legacy-identity" as any)

      const result = await getIdentity(dto, account)

      expect(getLegacyThirdPartyAuthSession).toHaveBeenCalledWith(
        expect.objectContaining({
          derivationOrigin: "https://derivation.example",
          maxTimeToLive: BigInt(60000),
        }),
      )
      expect(delegationChainFromDelegation).toHaveBeenCalledWith(
        "legacy-session",
      )
      expect(result).toBe("legacy-identity")

      fromDelegationSpy.mockRestore()
    })

    it("should throw for an undefined account type", async () => {
      const account = buildAccount({ type: "UNKNOWN" as AccountType })

      await expect(getIdentity(dto, account)).rejects.toThrow(
        "Account type is not defined",
      )
    })
  })

  describe("getRequestMetadata routing (private)", () => {
    const getRequestMetadata = (service as any).getRequestMetadata.bind(service)

    const buildMessage = (method: string) =>
      ({ data: { params: { method } } }) as unknown as MessageEvent<RPCMessage>

    it("should route icrc2_approve to getMetadataICRC2Approve", async () => {
      (getMetadataICRC2Approve as jest.Mock).mockResolvedValue("icrc2-meta")

      const result = await getRequestMetadata(
        buildMessage("icrc2_approve"),
        "[]",
      )

      expect(getMetadataICRC2Approve).toHaveBeenCalledWith(
        buildMessage("icrc2_approve"),
        "[]",
      )
      expect(result).toBe("icrc2-meta")
    })

    it("should route transfer to getLedgerTransferMetadata", async () => {
      (getLedgerTransferMetadata as jest.Mock).mockResolvedValue("ledger-meta")

      const result = await getRequestMetadata(buildMessage("transfer"), "[]")

      expect(getLedgerTransferMetadata).toHaveBeenCalled()
      expect(result).toBe("ledger-meta")
    })

    it("should route icrc1_transfer to getIcrc1TransferMetadata", async () => {
      (getIcrc1TransferMetadata as jest.Mock).mockResolvedValue("icrc1-meta")

      const result = await getRequestMetadata(
        buildMessage("icrc1_transfer"),
        "[]",
      )

      expect(getIcrc1TransferMetadata).toHaveBeenCalled()
      expect(result).toBe("icrc1-meta")
    })

    it("should fall back to getDefaultMetadata for unknown methods", async () => {
      (getDefaultMetadata as jest.Mock).mockResolvedValue("default-meta")

      const message = buildMessage("some_other_method")
      const result = await getRequestMetadata(message, "[]")

      expect(getDefaultMetadata).toHaveBeenCalledWith(message)
      expect(result).toBe("default-meta")
    })
  })

  describe("onApprove", () => {
    it("should call the canister and wrap the response as an RPCSuccessResponse", async () => {
      (authStorage.get as jest.Mock).mockResolvedValue(
        JSON.stringify([buildAccount()]),
      )
      ;(authState.get as jest.Mock).mockReturnValue({
        delegationIdentity: "root-delegation",
      })
      ;(getGlobalDelegation as jest.Mock).mockResolvedValue(
        "resolved-delegation",
      )
      ;(callCanisterService.call as jest.Mock).mockResolvedValue({
        contentMap: "cbor",
        certificate: "cert",
      })

      const message = {
        origin: ORIGIN,
        data: {
          jsonrpc: "2.0",
          id: "42",
          method: "icrc49_call_canister",
          params: {
            canisterId: "aaaaa-aa",
            sender: "2vxsx-fae",
            method: "icrc1_transfer",
            arg: "AA==",
          },
        },
      } as unknown as MessageEvent<RPCMessage>

      const response = await service.onApprove(message)

      expect(callCanisterService.call).toHaveBeenCalledWith(
        expect.objectContaining({
          canisterId: "aaaaa-aa",
          calledMethodName: "icrc1_transfer",
          parameters: "AA==",
        }),
      )
      expect(response).toEqual({
        origin: ORIGIN,
        jsonrpc: "2.0",
        id: "42",
        result: { contentMap: "cbor", certificate: "cert" },
      })
    })
  })

  describe("getComponentData", () => {
    // Node pools small Buffer.from(base64) allocations, and this @icp-sdk
    // version reads decoded bytes from byteOffset 0 of the *underlying*
    // ArrayBuffer instead of the buffer's own byteOffset — so a short pooled
    // buffer silently decodes garbage. Encoding a payload above the pooling
    // threshold (Buffer.poolSize >>> 1, 4096 bytes) forces a dedicated,
    // offset-0 allocation and keeps this test deterministic.
    const DECODED_TEXT = "hello-".repeat(1000)
    const ENCODED_ARG = Buffer.from(
      IDL.encode([IDL.Text], [DECODED_TEXT]),
    ).toString("base64")

    const buildMessage = () =>
      ({
        origin: ORIGIN,
        data: {
          method: "icrc49_call_canister",
          params: {
            canisterId: "aaaaa-aa",
            sender: "2vxsx-fae",
            method: "icrc1_transfer",
            arg: ENCODED_ARG,
          },
        },
      }) as unknown as MessageEvent<RPCMessage>

    beforeEach(() => {
      (authStorage.get as jest.Mock).mockResolvedValue(
        JSON.stringify([buildAccount()]),
      )
      ;(authState.get as jest.Mock).mockReturnValue({
        delegationIdentity: "root-delegation",
      })
      ;(getGlobalDelegation as jest.Mock).mockResolvedValue(
        "resolved-delegation",
      )
      ;(consentMessageService.getConsentMessage as jest.Mock).mockResolvedValue(
        "Please confirm this transfer",
      )
    })

    it("should decode candid args via the interface factory when available", async () => {
      const idlFactory = ({ IDL }: any) =>
        IDL.Service({
          icrc1_transfer: IDL.Func([IDL.Text], [], []),
        })
      ;(
        interfaceFactoryService.getInterfaceFactory as jest.Mock
      ).mockResolvedValue(idlFactory)
      ;(getIcrc1TransferMetadata as jest.Mock).mockResolvedValue({
        toAddress: "abc",
      })

      const result = await service.getComponentData(buildMessage())

      expect(result.consentMessage).toBe("Please confirm this transfer")
      expect(result.canisterId).toBe("aaaaa-aa")
      expect(result.sender).toBe("2vxsx-fae")
      expect(result.methodName).toBe("icrc1_transfer")
      expect(JSON.parse(result.args)).toEqual([DECODED_TEXT])
      expect(result.metadata).toEqual({ toAddress: "abc" })
    })

    it("should fall back to the raw base64 arg when the interface factory throws", async () => {
      (
        interfaceFactoryService.getInterfaceFactory as jest.Mock
      ).mockRejectedValue(new Error("no candid metadata"))
      ;(getIcrc1TransferMetadata as jest.Mock).mockResolvedValue({
        toAddress: "abc",
      })

      const result = await service.getComponentData(buildMessage())

      expect(result.args).toBe(ENCODED_ARG)
    })
  })
})
