import { SignIdentity } from "@dfinity/agent"
import { Ed25519KeyIdentity } from "@dfinity/identity"
import { createHash } from "crypto"
import { unpackResponse } from "src/integration/_common"
import { mapProfile } from "src/integration/identity-manager"

import {
  authState,
  DeviceType,
  Icon,
  im,
  Profile,
  replaceActorIdentity,
  requestFEDelegation,
} from "@nfid/integration"

import {
  AccessPointRequest,
  HTTPAccountRequest,
} from "../_ic_api/identity_manager.d"

export interface PasswordManager {
  signinWithPassword(password: string): Promise<SignIdentity>

  registerPasswordProfile(password: string): Promise<Profile>

  changePassword(oldPassword: string, newPassword: string): Promise<void>
}

export class PasswordManagerImpl implements PasswordManager {
  async signinWithPassword(password: string): Promise<SignIdentity> {
    const hash = this.hashPassword(authState.getUserIdData().anchor + password)
    const passwordIdentity = Ed25519KeyIdentity.generate(
      this.hexStringToUint8Array(hash),
    )
    await requestFEDelegation(passwordIdentity).then(async (result) => {
      return authState.set({
        identity: passwordIdentity,
        delegationIdentity: result.delegationIdentity,
        chain: result.chain,
        sessionKey: result.sessionKey,
      })
    })
    return passwordIdentity
  }

  async registerPasswordProfile(password: string): Promise<Profile> {
    const tempIdentity = Ed25519KeyIdentity.generate()
    await replaceActorIdentity(im, tempIdentity)
    const dd: AccessPointRequest = {
      icon: Icon.password,
      device: DeviceType.Password,
      pub_key: tempIdentity.getPrincipal().toText(),
      browser: "",
      device_type: { Password: null },
      credential_id: [],
    }
    const accountRequest: HTTPAccountRequest = {
      access_point: [dd],
      wallet: [{ NFID: null }],
      anchor: BigInt(0), //we will calculate new anchor on IM side
      email: [],
    }
    const profile: Profile = await im
      .create_account(accountRequest)
      .then((response) => {
        console.debug("createNFIDProfile", { response })
        if (response.status_code !== 200) {
          throw Error("Unable to create account: " + response.error)
        }
        return response
      })
      .then((r) => mapProfile(unpackResponse(r)))
      .catch((e) => {
        throw new Error(`createProfile im.create_account: ${e.message}`)
      })

    const hash = this.hashPassword(profile.anchor + password)
    console.log("profile.anchor", profile.anchor)
    console.log("hash", hash)
    const passwordIdentity = Ed25519KeyIdentity.generate(
      this.hexStringToUint8Array(hash),
    )
    const userDevice: AccessPointRequest = {
      icon: Icon.password,
      device: DeviceType.Password,
      pub_key: passwordIdentity.getPrincipal().toText(),
      browser: "",
      device_type: { Password: null },
      credential_id: [],
    }
    await im.create_access_point(userDevice).then(() => {
      replaceActorIdentity(im, passwordIdentity)
      im.remove_access_point({
        pub_key: tempIdentity.getPrincipal().toText(),
      })
    })

    await requestFEDelegation(tempIdentity).then(async (result) => {
      await authState.set({
        identity: tempIdentity,
        delegationIdentity: result.delegationIdentity,
        chain: result.chain,
        sessionKey: result.sessionKey,
      })
    })

    return profile
  }

  async changePassword(
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    const hash = this.hashPassword(
      authState.getUserIdData().anchor + newPassword,
    )
    const newIdentity = Ed25519KeyIdentity.generate(
      this.hexStringToUint8Array(hash),
    )
    const dd: AccessPointRequest = {
      icon: Icon.password,
      device: DeviceType.Password,
      pub_key: newIdentity.getPrincipal().toText(),
      browser: "",
      device_type: { Password: null },
      credential_id: [],
    }

    const oldHash = this.hashPassword(
      authState.getUserIdData().anchor + oldPassword,
    )
    const currentIdentity = Ed25519KeyIdentity.generate(
      this.hexStringToUint8Array(oldHash),
    )

    const isPasswordIdentityLoggedIn =
      authState.get().delegationIdentity?.getPrincipal().toText() ===
      currentIdentity.getPrincipal().toText()

    await im.create_access_point(dd).then(() => {
      if (isPasswordIdentityLoggedIn) {
        replaceActorIdentity(im, newIdentity)
      }
      return im.remove_access_point({
        pub_key: currentIdentity.getPrincipal().toText(),
      })
    })

    if (isPasswordIdentityLoggedIn) {
      await requestFEDelegation(newIdentity).then(async (result) => {
        await authState.set({
          identity: newIdentity,
          delegationIdentity: result.delegationIdentity,
          chain: result.chain,
          sessionKey: result.sessionKey,
        })
      })
    }
  }

  private hexStringToUint8Array(hexString: string) {
    const cleanedString = hexString.replace(/[^0-9a-f]/gi, "").toLowerCase()
    const bytePairs = cleanedString.match(/.{1,2}/g)
    const byteValues = bytePairs!.map((bytePair) => parseInt(bytePair, 16))
    return new Uint8Array(byteValues)
  }

  hashPassword(password: string): string {
    const iterations = 100000
    let hash = password + "Y1gQQxfrwyhZVDGdRgO4Gke01wkz287d"
    for (let i = 0; i < iterations; i++) {
      hash = createHash("sha256").update(hash).digest("hex")
    }
    return hash
  }
}

export const passwordManager = new PasswordManagerImpl()
