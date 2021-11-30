import { blobToHex } from "@dfinity/candid"
import { WebAuthnIdentity } from "@dfinity/identity"
import clsx from "clsx"
import { creationOptions, IIConnection } from "frontend/ii-utils/iiConnection"
import { parseUserNumber } from "frontend/ii-utils/userNumber"
import { Button } from "frontend/ui-utils/atoms/button"
import { Divider } from "frontend/ui-utils/atoms/divider"
import { QRCode } from "frontend/ui-utils/atoms/qrcode"
import { Card } from "frontend/ui-utils/molecules/card"
import { CardBody } from "frontend/ui-utils/molecules/card/body"
import { CardTitle } from "frontend/ui-utils/molecules/card/title"
import { AppScreen } from "frontend/ui-utils/templates/AppScreen"
import React from "react"
import { useForm } from "react-hook-form"
import { Link, useHistory } from "react-router-dom"

export const LinkInternetIdentity = () => {
  const { push } = useHistory()
  const [addDeviceLink, setAddDeviceLink] = React.useState<string>("")

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()

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

    const url = new URL("http://qjdve-lqaaa-aaaaa-aaaeq-cai.localhost:8000")
    url.pathname = "/"
    url.hash = `#device=${userNumber};${blobToHex(publicKey)};${rawId}`
    const link = encodeURI(url.toString())
    console.log(">> ", { link })

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
