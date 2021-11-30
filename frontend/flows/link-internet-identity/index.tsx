import { blobToHex } from "@dfinity/candid"
import { WebAuthnIdentity } from "@dfinity/identity"
import clsx from "clsx"
import { creationOptions, IIConnection } from "frontend/ii-utils/iiConnection"
import { parseUserNumber } from "frontend/ii-utils/userNumber"
import { Button } from "frontend/ui-utils/atoms/button"
import { Centered } from "frontend/ui-utils/atoms/centered"
import { QRCode } from "frontend/ui-utils/atoms/qrcode"
import { Screen } from "frontend/ui-utils/atoms/screen"
import React from "react"
import { Helmet } from "react-helmet"
import { useForm } from "react-hook-form"
import { Link, useHistory } from "react-router-dom"

export const LinkInternetIdentity = () => {
  const { push } = useHistory()
  const [addDeviceLink, setAddDeviceLink] = React.useState<string>("")

  const { register, handleSubmit } = useForm()

  const submit = React.useCallback(async (data: any) => {
    const userNumber = parseUserNumber(data.anchor)
    if (!userNumber) {
      throw new Error("Invalid anchor")
    }

    const existingDevices = await IIConnection.lookupAll(userNumber)

    let identity
    try {
      identity = await WebAuthnIdentity.create({
        publicKey: creationOptions(existingDevices),
      })
    } catch (error) {
      return console.error({
        title: "Failed to authenticate",
        message:
          "We failed to collect the necessary information from your security device.",
        // @ts-ignore
        detail: error.message,
        primaryButton: "Try again",
      })
    }
    const publicKey = identity.getPublicKey().toDer()
    const rawId = blobToHex(identity.rawId)

    // const url = new URL("http://qjdve-lqaaa-aaaaa-aaaeq-cai.localhost:8000")
    // TODO: pull from env
    const url = new URL("https://identity.ic0.app")
    url.pathname = "/"
    url.hash = `#device=${userNumber};${blobToHex(publicKey)};${rawId}`
    const link = encodeURI(url.toString())
    console.log(">> ", { link })

    setAddDeviceLink(link)

    console.log(data)
  }, [])

  return (
    <Screen
      className={clsx("bg-gradient-to-b from-blue-400 via-white to-white")}
    >
      <Helmet>
        <meta name="theme-color" content="#3eb3e5" />
      </Helmet>
      <div className={clsx("p-7 py-10 flex flex-col h-full")}>
        <h1 className={clsx("text-center font-bold text-3xl")}>
          Link your existing internet identity anchor?
        </h1>
        <div className={clsx("flex-grow")} />
        <Centered>
          {addDeviceLink ? (
            <a href={addDeviceLink} target="_blank">
              <Button className={clsx("p-1 px-3")}>Link Device</Button>
            </a>
          ) : (
            <form onSubmit={handleSubmit(submit)}>
              <input
                {...register("anchor")}
                className={clsx("p-1 border border-r-0 rounded rounded-r-none")}
              />
              <input
                type="submit"
                className={clsx("p-1 border rounded rounded-l-none")}
              />
            </form>
          )}
        </Centered>
      </div>
    </Screen>
  )
}
