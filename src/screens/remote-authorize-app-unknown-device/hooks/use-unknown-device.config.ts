import { PublicKey } from "@dfinity/agent"
import { blobFromUint8Array, blobToHex } from "@dfinity/candid"
import { DelegationChain, Ed25519KeyIdentity } from "@dfinity/identity"
import { atom, useAtom } from "jotai"
import React, { useEffect } from "react"
import { generatePath, useLocation } from "react-router-dom"
import { v4 as uuid } from "uuid"

import { RegisterNewDeviceConstants } from "frontend/flows/screens-app/register-new-from-delegate/routes"
import { AppScreenAuthorizeAppConstants } from "frontend/flows/screens-app/remote-authentication/routes"
import { useAuthentication } from "frontend/hooks/use-authentication"
import { useIsIframe } from "frontend/hooks/use-is-iframe"
import { useMultipass } from "frontend/hooks/use-multipass"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { useDevices } from "frontend/services/identity-manager/devices/hooks"
import { usePersona } from "frontend/services/identity-manager/persona/hooks"
import { apiResultToLoginResult } from "frontend/services/internet-identity/api-result-to-login-result"
import { buildDelegate } from "frontend/services/internet-identity/build-delegate"
import { IIConnection } from "frontend/services/internet-identity/iiConnection"
import { usePubSubChannel } from "frontend/services/pub-sub-channel/use-pub-sub-channel"

import { useMessageChannel } from "./use-message-channel"

declare const FRONTEND_MODE: string

type loadingState = "initial" | "loading" | "success"

export type NfidJsonDelegate = {
  chain: DelegationChain | undefined
  sessionKey: Ed25519KeyIdentity | undefined
}

export type SignedDelegation = {
  delegation: {
    pubkey: PublicKey
    expiration: string
    targets: undefined
  }
  signature: number[]
  userKey: PublicKey
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

  const isIframe = useIsIframe()

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
  const { applicationName, applicationLogo } = useMultipass()
  const { getMessages } = usePubSubChannel()
  const { remoteLogin } = useAuthentication()
  const { readAccount } = useAccount()
  const { getPersona } = usePersona()

  const url = React.useMemo(() => {
    // TODO: create custom hook to generate secret
    const query = new URLSearchParams({
      applicationName: applicationName || "",
      applicationLogo: encodeURIComponent(applicationLogo || ""),
    }).toString()
    return domain && secret
      ? `${window.location.origin}${generatePath(
          AppScreenAuthorizeAppConstants.authorize,
          { secret, scope: domain },
        )}?${query.toString()}`
      : null
  }, [applicationLogo, applicationName, domain, secret])

  const { isReady, postClientReadyMessage, postClientAuthorizeSuccessMessage } =
    useMessageChannel({
      messageHandler: {
        "authorize-client": (event: any) => {
          const { sessionPublicKey } = event.data
          const blog = blobFromUint8Array(sessionPublicKey)
          const hex = blobToHex(blog)

          setAppWindow(event.source)
          setPubKey(hex)
          setDomain(new URL(event.origin).host)
        },
      },
    })

  const handleStoreNewDevice = React.useCallback(
    async ({ device }) => {
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

      postClientAuthorizeSuccessMessage(appWindow, {
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

    if (isIframe) {
      return window.open(
        generatePath(RegisterNewDeviceConstants.base, {
          userNumber: userNumber.toString(),
        }),
        "_blank",
      )
    }
    const { device } = await createWebAuthNDevice(BigInt(userNumber))

    await handleStoreNewDevice({ device })
    await Promise.all([readAccount(), getPersona()])
    handleSendDelegate()
    setStatus("loading")
  }, [
    createWebAuthNDevice,
    getPersona,
    handleSendDelegate,
    handleStoreNewDevice,
    isIframe,
    readAccount,
    setStatus,
    userNumber,
  ])

  const handleLoginFromRemoteDelegation = React.useCallback(
    async (nfidJsonDelegate, userNumber) => {
      const loginResult = await IIConnection.loginFromRemoteFrontendDelegation({
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

      const {
        body: [messages],
      } = await getMessages(secret)

      if (messages && messages.length > 0) {
        const parsedMessages = messages.map((m: string) => JSON.parse(m))
        const waitingMessage = parsedMessages.find(
          (m: { type: string }) => m.type === "remote-login-wait-for-user",
        )
        const registerMessage = parsedMessages.find(
          (m: { type: string }) => m.type === "remote-login-register",
        )

        if (registerMessage) {
          setUserNumber(BigInt(registerMessage.userNumber))
          setSignedDelegation({
            delegation: registerMessage.delegation,
            signature: registerMessage.signature,
            userKey: registerMessage.userKey,
          })

          handleLoginFromRemoteDelegation(
            registerMessage.nfid,
            registerMessage.userNumber,
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
      getMessages,
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
