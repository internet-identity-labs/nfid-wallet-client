import { Principal } from "@dfinity/principal"
import { format } from "date-fns"
import toaster from "packages/ui/src/atoms/toast"

import {
  DeviceType,
  Icon,
  LambdaPasskeyDecoded,
  RootWallet,
  authState,
  getPasskey,
  im,
  replaceActorIdentity,
} from "@nfid/integration"

import { removeAccessPointFacade } from "frontend/integration/facade"
import { fetchProfile } from "frontend/integration/identity-manager"
import {
  IC_DERIVATION_PATH,
  addDevice,
  fetchAllDevices,
} from "frontend/integration/internet-identity"
import { fromMnemonicWithoutValidation } from "frontend/integration/internet-identity/crypto/ed25519"

import { passkeyConnector } from "../authentication/auth-selection/passkey-flow/services"
import { isPasskeyDevice, isRecoveryDevice } from "./helpers"
import { IDevice, IGroupedDevices } from "./types"
import { mapIIDevicesToIDevices, mapIMDevicesToIDevices } from "./utils"

export class SecurityConnector {
  async getIMDevices() {
    const { data: imDevices } = await im.read_access_points()
    return mapIMDevicesToIDevices(imDevices[0] ?? [])
  }

  async getIIDevices() {
    const profile = await fetchProfile()
    if (profile.wallet !== RootWallet.II) return []
    const devices = await fetchAllDevices(BigInt(profile?.anchor))
    return mapIIDevicesToIDevices(devices)
  }

  getDevices = async (): Promise<IGroupedDevices> => {
    const cacheUserData = authState.getUserIdData()

    const imDevices = await this.getIMDevices()

    const allDevices =
      cacheUserData.wallet === RootWallet.II
        ? await this.getIIDevices().then((devices) =>
            devices.map((d) => ({
              ...d,
              ...imDevices.find((p) => p.principal === d.principal),
              type: d.type,
            })),
          )
        : imDevices

    const allCredentials: string[] = allDevices
      .filter((d) => !d.isLegacyDevice)
      ?.map((d) => d.credentialId)
      .filter((d) => d?.length)

    const passkeysMetadata: LambdaPasskeyDecoded[] = allCredentials.length
      ? (await getPasskey(allCredentials)).map((p) => ({
          key: p.key,
          data: JSON.parse(p.data),
        }))
      : []

    const allDevicesWithMetadata = allDevices?.map((device) => {
      const passkeyMetadata = passkeysMetadata.find(
        (p) => p.key === device?.credentialId,
      )

      return {
        label: device.label,
        icon: device?.icon,
        origin: passkeyMetadata?.data.clientData.origin,
        isLegacyDevice: !passkeyMetadata,
        isMultiDevice:
          passkeyMetadata?.data.type === "cross-platform" ||
          passkeyMetadata?.data.transports.includes("hybrid"),
        created_at: passkeyMetadata?.data?.created_at
          ? format(new Date(passkeyMetadata?.data?.created_at), "MMM dd, yyyy")
          : "",
        last_used: device?.last_used
          ? format(
              new Date(Number(BigInt(device?.last_used) / BigInt(1000000))),
              "MMM dd, yyyy",
            )
          : "",
        type: device.type,
        principal: device.principal,
        credentialId: passkeyMetadata?.key,
        publickey: device.publickey,
      } as IDevice
    })

    return {
      recoveryDevice: allDevicesWithMetadata.find(isRecoveryDevice),
      passkeys: allDevicesWithMetadata.filter(isPasskeyDevice),
      emailDevice: allDevicesWithMetadata.find(
        (d) => d.type === DeviceType.Email,
      ),
    }
  }

  async createRecoveryPhrase(phrase: string) {
    const profile = await fetchProfile()
    const phraseWithoutAnchor = phrase?.split(" ")
    phraseWithoutAnchor?.shift()

    const recoverIdentity = await fromMnemonicWithoutValidation(
      phraseWithoutAnchor.join(" "),
      IC_DERIVATION_PATH,
    )
    const deviceName = "Recovery phrase"

    if (profile?.wallet === RootWallet.II) {
      // Add recovery device to II
      addDevice(
        BigInt(profile?.anchor),
        deviceName,
        { seed_phrase: null },
        { recovery: null },
        recoverIdentity.getPublicKey().toDer(),
        undefined as any,
        true,
      )
    }

    return await im
      .create_access_point({
        icon: Icon.document,
        device: "Recovery Phrase",
        browser: "",
        pub_key: Principal.selfAuthenticating(
          new Uint8Array(
            await new Blob([
              recoverIdentity.getPublicKey().toDer(),
            ]).arrayBuffer(),
          ),
        ).toText(),
        device_type: { Recovery: null },
        credential_id: [],
      })
      .catch((e) => {
        throw new Error(
          `createRecoveryDevice im.create_access_point: ${e.message}`,
        )
      })
  }

  async deleteRecoveryPhrase(phrase: string) {
    const profile = await fetchProfile()
    const phraseWithoutAnchor = phrase?.split(" ")
    phraseWithoutAnchor?.shift()

    const oldIdent = authState.get().delegationIdentity
    if (!oldIdent) throw new Error("No delegation identity found")

    try {
      const recoverIdentity = await fromMnemonicWithoutValidation(
        phraseWithoutAnchor.join(" "),
        IC_DERIVATION_PATH,
      )

      await replaceActorIdentity(im, recoverIdentity)

      await removeAccessPointFacade(
        BigInt(profile.anchor),
        recoverIdentity.getPrincipal().toText(),
        Array.from(new Uint8Array(recoverIdentity.getPublicKey().toDer())),
        profile.wallet === RootWallet.II,
      )
    } catch (e) {
      console.log({ e })
      toaster.error(
        "We could not delete your recovery phrase. Please make sure you have entered the correct phrase.",
      )
    } finally {
      replaceActorIdentity(im, oldIdent)
    }
  }

  async toggle2FA(enabled: boolean) {
    if (enabled) {
      const profile = await fetchProfile()
      const email = profile.accessPoints.find(
        (p) => p.deviceType === DeviceType.Email,
      )

      if (
        email?.principalId ===
        authState.get().delegationIdentity?.getPrincipal().toText()
      )
        await passkeyConnector.loginWithAllowedPasskey()
    }

    await im.update_2fa(enabled).catch(async (e: any) => {
      if (e.message.includes("Unauthorised")) {
        await passkeyConnector.loginWithAllowedPasskey()
        await im.update_2fa(enabled)
      } else {
        toaster.error(e.message)
        throw new Error(`im.update_2fa: ${e.message}`)
      }
    })

    if (enabled) toaster.success("Self-sovereign mode enabled")
    else toaster.success("Self-sovereign mode disabled")
  }
}

export const securityConnector = new SecurityConnector()
