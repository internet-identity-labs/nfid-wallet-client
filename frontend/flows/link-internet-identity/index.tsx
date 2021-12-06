import { blobToHex } from "@dfinity/candid"
import { WebAuthnIdentity } from "@dfinity/identity"
import clsx from "clsx"
import { CONFIG } from "frontend/config"
import { Button } from "frontend/design-system/atoms/button"
import { Divider } from "frontend/design-system/atoms/divider"
import { Card } from "frontend/design-system/molecules/card"
import { CardBody } from "frontend/design-system/molecules/card/body"
import { CardTitle } from "frontend/design-system/molecules/card/title"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import {
  creationOptions,
  IIConnection,
} from "frontend/utils/internet-identity/iiConnection"
import { parseUserNumber } from "frontend/utils/internet-identity/userNumber"
import React from "react"
import { useForm } from "react-hook-form"

export const LinkInternetIdentity = () => {
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

    const url = new URL(
      CONFIG.II_ENV === "development"
        ? `http://${CONFIG.II_CANISTER_ID}.localhost:3000`
        : "https://identity.ic0.app",
    )
    url.pathname = "/"
    url.hash = `#device=${userNumber};${blobToHex(publicKey)};${rawId}`
    const link = encodeURI(url.toString())

    setAddDeviceLink(link)

    console.log(data)
  }, [])

  return (
    <AppScreen>
      <Card className="flex flex-col h-full">
        <CardTitle>Link your existing internet identity anchor?</CardTitle>

        <Divider noGutters />

        <CardBody className="justify-center flex h-full items-center">
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
        </CardBody>
      </Card>
    </AppScreen>
  )
}
