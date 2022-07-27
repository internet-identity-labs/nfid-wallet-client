import { PublicKey } from "@dfinity/agent"
import { toHexString } from "@dfinity/candid/lib/cjs/utils/buffer"
import { DelegationChain, Ed25519KeyIdentity } from "@dfinity/identity"
import { atom, useAtom } from "jotai"
import React, { useEffect } from "react"
import { generatePath, useLocation } from "react-router-dom"
import { v4 as uuid } from "uuid"

import { AppScreenAuthorizeAppConstants } from "frontend/apps/authentication/remote-authentication/routes"
import { useAuthentication } from "frontend/apps/authentication/use-authentication"
import { useMultipass } from "frontend/apps/identity-provider/use-app-meta"
import { ERROR_DEVICE_IN_EXCLUDED_CREDENTIAL_LIST } from "frontend/integration/identity"
import { useAccount } from "frontend/integration/identity-manager/account/hooks"
import {
  useDevices,
  WebAuthnDevice,
} from "frontend/integration/identity-manager/devices/hooks"
import { usePersona } from "frontend/integration/identity-manager/persona/hooks"
import { loginFromRemoteFrontendDelegation } from "frontend/integration/internet-identity"
import { apiResultToLoginResult } from "frontend/integration/internet-identity/api-result-to-login-result"
import { buildDelegate } from "frontend/integration/internet-identity/build-delegate"
import {
  getMessages,
  NFIDLoginRegisterMessage,
} from "frontend/integration/pubsub"

import { useMessageChannel } from "./use-message-channel"

declare const FRONTEND_MODE: string

type loadingState = "initial" | "loading" | "success"

export type NfidJsonDelegate = {
  chain: DelegationChain | undefined
  sessionKey: Ed25519KeyIdentity | undefined
}

export type SignedDelegation = {
  delegation: {
    pubkey: number[]
    expiration: string
    targets: undefined
  }
  signature: number[]
  userKey: number[]
}

type StateProps = {
  userNumber?: bigint
  from?: string
}

const registerAtom = atom<boolean>(false)
const userNumberAtom = atom<bigint | undefined>(undefined)
const loadingAtom = atom<loadingState>("initial")
const delegationAtom = atom<SignedDelegation | undefined>(undefined)
const domainAtom = atom<string | undefined>(undefined)
const secretAtom = atom<string | undefined>(undefined)

const useSecret = () => {
  const [secret, setSecret] = useAtom(secretAtom)
  React.useEffect(() => {
    !secret && setSecret(uuid())
  }, [secret, setSecret])

  return secret
}
export const useUnknownDeviceConfig = () => {
  const [status, setStatus] = useAtom(loadingAtom)
  const [showRegister, setShowRegister] = useAtom(registerAtom)
  const [signedDelegation, setSignedDelegation] = useAtom(delegationAtom)
  const secret = useSecret()

  const { state } = useLocation()
  const [userNumber, setUserNumber] = useAtom(userNumberAtom)

  useEffect(() => {
    const number = (state as StateProps)?.userNumber
    if (number) setUserNumber(number)
  }, [setUserNumber, state])

  React.useState<bigint | undefined>((state as StateProps)?.userNumber)
  const [fromPath, setFromPath] = React.useState((state as StateProps)?.from)

  const [appWindow, setAppWindow] = React.useState<Window | null>(null)
  const [domain, setDomain] = useAtom(domainAtom)
  const [pubKey, setPubKey] = React.useState("")
  const [newDeviceKey, setNewDeviceKey] = React.useState<any | null>(null)

  const { createDevice, createWebAuthNDevice } = useDevices()
  const { applicationName, applicationLogo, applicationDerivationOrigin } =
    useMultipass()
  const { remoteLogin } = useAuthentication()
  const { readAccount } = useAccount()
  const { getPersona } = usePersona()

  // https://philipp.eu.ngrok.io/rdp/6e8f055d-11cb-42b2-8f2d-0566dbd4c9bf/localhost:3000/?applicationName=NFID-Demo&applicationDerivationOrigin=&applicationLogo=https%253A%252F%252Flogo.clearbit.com%252Fclearbit.com
  const url = React.useMemo(() => {
    // TODO: create custom hook to generate secret
    const query = new URLSearchParams({
      applicationName: applicationName || "",
      applicationLogo: encodeURIComponent(applicationLogo || ""),
    }).toString()

    if (!domain || !secret) return null

    const qrcodePath =
      applicationDerivationOrigin && applicationDerivationOrigin.length > 1
        ? AppScreenAuthorizeAppConstants.authorizeDerivationOrigin
        : AppScreenAuthorizeAppConstants.authorize

    const path = generatePath(qrcodePath, {
      secret,
      scope: domain,
      ...(applicationDerivationOrigin
        ? { derivationOrigin: applicationDerivationOrigin }
        : {}),
    })

    return `${window.location.origin}${path}?${query.toString()}`
  }, [
    applicationDerivationOrigin,
    applicationLogo,
    applicationName,
    domain,
    secret,
  ])

  const { isReady, postClientReadyMessage, postClientAuthorizeSuccessMessage } =
    useMessageChannel({
      messageHandler: {
        "authorize-client": async (event: any) => {
          const { sessionPublicKey } = event.data
          const blob = new Blob([sessionPublicKey])
          const hex = toHexString(await blob.arrayBuffer())

          setAppWindow(event.source)
          setPubKey(hex)
          setDomain(new URL(event.origin).host)
        },
      },
    })

  const handleStoreNewDevice = React.useCallback(
    async ({ device }: { device: WebAuthnDevice }) => {
      if (!userNumber) throw new Error("No anchor found")

      setNewDeviceKey(device.publicKey)
      return await createDevice({
        ...device,
        userNumber: userNumber,
      })
    },
    [createDevice, userNumber],
  )

  React.useEffect(() => {
    isReady && postClientReadyMessage()
  }, [isReady, postClientReadyMessage])

  const handleSendDelegate = React.useCallback(async () => {
    try {
      if (!signedDelegation) throw new Error("No signed delegation found")

      const parsedSignedDelegation = buildDelegate(signedDelegation)

      const protocol =
        FRONTEND_MODE === "development" ? "http:" : window.location.protocol
      const hostname = `${protocol}//${domain}`

      postClientAuthorizeSuccessMessage(appWindow as Window, {
        parsedSignedDelegation,
        userKey: signedDelegation.userKey,
        hostname,
      })
    } catch (err) {
      console.error(">> not a valid delegate", { err })
    }
  }, [signedDelegation, domain, postClientAuthorizeSuccessMessage, appWindow])

  const handleRegisterDevice = React.useCallback(async () => {
    if (!userNumber) throw new Error("userNumber required")
    setStatus("loading")

    try {
      const { device } = await createWebAuthNDevice(BigInt(userNumber))
      await handleStoreNewDevice({ device })
    } catch (e: any) {
      if (e.message !== ERROR_DEVICE_IN_EXCLUDED_CREDENTIAL_LIST) {
        throw e
      }
      console.debug(handleRegisterDevice.name, "device already registered")
    }

    await Promise.all([readAccount(), getPersona()])
    handleSendDelegate()
    setStatus("loading")
  }, [
    createWebAuthNDevice,
    getPersona,
    handleSendDelegate,
    handleStoreNewDevice,
    readAccount,
    setStatus,
    userNumber,
  ])

  const handleLoginFromRemoteDelegation = React.useCallback(
    async (
      nfidJsonDelegate: NFIDLoginRegisterMessage["reconstructableIdentity"],
      userNumber: number,
    ) => {
      const loginResult = await loginFromRemoteFrontendDelegation({
        chain: JSON.stringify(nfidJsonDelegate.chain),
        sessionKey: JSON.stringify(nfidJsonDelegate.sessionKey),
        userNumber: BigInt(userNumber),
      })
      const result = apiResultToLoginResult(loginResult)

      if (result.tag === "ok") {
        remoteLogin(result)
      }
      // TODO: handle this more gracefully
      if (result.tag !== "ok") throw new Error("login failed")
    },
    [remoteLogin],
  )

  const handlePollForDelegate = React.useCallback(
    async (cancelPoll: () => void) => {
      if (!secret) return

      const messages = await getMessages(secret)

      if (messages && messages.length > 0) {
        const parsedMessages = messages.map((m: string) => JSON.parse(m))
        const waitingMessage = parsedMessages.find(
          (m: { type: string }) => m.type === "remote-login-wait-for-user",
        )
        const registerMessage = parsedMessages.find(
          (m: { type: string }) => m.type === "remote-login-register",
        ) as NFIDLoginRegisterMessage | undefined

        if (registerMessage) {
          setUserNumber(BigInt(registerMessage.anchor))

          // NOTE: WE MOVED THE AUTHORIZATION TO THE INVOKING DEVICE (DESKTOP)
          // setSignedDelegation({
          //   delegation: registerMessage.delegation,
          //   signature: registerMessage.signature,
          //   userKey: registerMessage.userKey,
          // })

          handleLoginFromRemoteDelegation(
            registerMessage.reconstructableIdentity,
            registerMessage.anchor,
          )

          setStatus("success")
          setShowRegister(true)
          cancelPoll()
          // FIXME: this is required because of a race condition
          // when there is also a waitingMessage in the same response
          return
        }

        if (waitingMessage && !registerMessage) {
          setStatus("loading")
        }
      }
    },
    [
      handleLoginFromRemoteDelegation,
      secret,
      setShowRegister,
      setSignedDelegation,
      setStatus,
      setUserNumber,
    ],
  )

  return {
    status,
    setStatus,
    url,
    pubKey,
    scope: domain,
    appWindow,
    userNumber,
    newDeviceKey,
    showRegister,
    setUserNumber,
    fromPath,
    setFromPath,
    setShowRegister,
    setNewDeviceKey,
    handleRegisterDevice,
    handleSendDelegate,
    postClientAuthorizeSuccessMessage,
    handleLoginFromRemoteDelegation,
    handlePollForDelegate,
    handleStoreNewDevice,
  }
}
