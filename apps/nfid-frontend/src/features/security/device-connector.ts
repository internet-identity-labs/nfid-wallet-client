import { Principal } from "@dfinity/principal"
import { format } from "date-fns"
import { toast } from "react-toastify"

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
import {
  fetchProfile,
  removeAccessPoint,
} from "frontend/integration/identity-manager"
import {
  IC_DERIVATION_PATH,
  addDevice,
} from "frontend/integration/internet-identity"
import { fromMnemonicWithoutValidation } from "frontend/integration/internet-identity/crypto/ed25519"

import { isPasskeyDevice, isRecoveryDevice } from "./helpers"
import { IDevice, IGroupedDevices } from "./types"

export class SecurityConnector {
  async getIMDevices(): Promise<IGroupedDevices> {
    const { data: imDevices } = await im.read_access_points()

    if (!imDevices.length)
      throw new Error("Unable to fetch im.get_access_points")

    const allCredentials: string[] = imDevices[0]
      .map((d) => d.credential_id.join(""))
      .filter((d) => d.length)

    const passkeysMetadata: LambdaPasskeyDecoded[] = allCredentials.length
      ? (await getPasskey(allCredentials)).map((p) => ({
          key: p.key,
          data: JSON.parse(p.data),
        }))
      : []

    const allDevices = imDevices[0].map((device) => {
      const passkeyMetadata = passkeysMetadata.find(
        (p) => p.key === device.credential_id[0],
      )

      return {
        label: device.device,
        icon: device.icon,
        isLegacyDevice: !passkeyMetadata,
        isMultiDevice: !!passkeyMetadata?.data?.flags.backupEligibility,
        created_at: passkeyMetadata?.data?.created_at
          ? format(new Date(passkeyMetadata?.data?.created_at), "MMM dd, yyyy")
          : "",
        last_used: device?.last_used
          ? format(
              new Date(Number(BigInt(device?.last_used) / BigInt(1000000))),
              "MMM dd, yyyy",
            )
          : "",
        type: Object.keys(device.device_type)[0],
        principal: device.principal_id,
        credentialId: passkeyMetadata?.key,
      } as IDevice
    })

    return {
      recoveryDevice: allDevices.find(isRecoveryDevice),
      passkeys: allDevices.filter(isPasskeyDevice),
      emailDevice: allDevices.find((d) => d.type === DeviceType.Email),
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
        false,
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
    try {
      const recoverIdentity = await fromMnemonicWithoutValidation(
        phraseWithoutAnchor.join(" "),
        IC_DERIVATION_PATH,
      )

      console.log(profile.wallet)
      if (profile.wallet === RootWallet.II) {
        console.log("remove ii")
        // Remove recovery device from II
        removeAccessPointFacade(
          BigInt(profile.anchor),
          recoverIdentity.getPrincipal().toText(),
        )
      }

      console.log("before replace")
      await replaceActorIdentity(im, recoverIdentity)
      console.log("after replace")
      const res = await removeAccessPoint(
        Principal.selfAuthenticating(
          new Uint8Array(
            await new Blob([
              recoverIdentity.getPublicKey().toDer(),
            ]).arrayBuffer(),
          ),
        ).toText(),
      )
      console.log({ res })
    } catch (e) {
      console.log({ e })
      toast.error(
        "We could not delete your recovery phrase. Please make sure you have entered the correct phrase.",
      )
    } finally {
      replaceActorIdentity(im, oldIdent!)
    }
  }
}

export const securityConnector = new SecurityConnector()
