import clsx from "clsx"
import { apiResultToLoginResult } from "frontend/ii-utils/api-result-to-login-result"
import { DeviceData } from "frontend/ii-utils/generated/internet_identity_types"
import { derFromPubkey, IIConnection } from "frontend/ii-utils/iiConnection"
import { parseUserNumber } from "frontend/ii-utils/userNumber"
import { Button } from "frontend/ui-utils/atoms/button"
import { Centered } from "frontend/ui-utils/atoms/centered"
import { Loader } from "frontend/ui-utils/atoms/loader"
import { Screen } from "frontend/ui-utils/atoms/screen"
import React from "react"
import { Helmet } from "react-helmet"
import { useForm } from "react-hook-form"

export const CopyDevices = () => {
  const [status, setStatus] = React.useState<
    "initial" | "loading" | "success" | "error"
  >("initial")
  const [anchors, setAnchors] = React.useState<{ [key: string]: string }>({})
  const [devices, setDevices] = React.useState<{ [key: string]: DeviceData[] }>(
    {},
  )

  const { register, handleSubmit } = useForm()

  const fetchDevices = React.useCallback(async (anchor) => {
    console.log(">> fetchDevices", { anchor })

    const userNumber = parseUserNumber(anchor)
    if (!userNumber) {
      throw new Error("Invalid anchor")
    }
    return await IIConnection.lookupAll(userNumber)
  }, [])

  const fetch = React.useCallback(
    (key) => async (data: any) => {
      const anchor = data[key]
      setAnchors({ ...anchors, [key]: anchor })
      const devicesB = await fetchDevices(anchor)
      setDevices({ ...devices, [key]: devicesB })
    },
    [anchors, devices, fetchDevices],
  )

  const copyDevice = React.useCallback(
    (otherAnchor) => async (device: DeviceData) => {
      const userNumber = parseUserNumber(anchors[otherAnchor])
      if (!userNumber) throw new Error("Invalid anchor")

      const response = await IIConnection.login(userNumber)
      const result = apiResultToLoginResult(response)
      if (result.tag === "ok") {
        console.log(">> ", { device })

        result.connection.add(
          userNumber,
          device.alias,
          device.key_type,
          device.purpose,
          derFromPubkey(device.pubkey),
          // device.credential_id,
        )
      }
    },
    [anchors],
  )

  return (
    <Screen
      className={clsx(
        "bg-gradient-to-b from-blue-400 via-white to-white flex-row",
      )}
    >
      <Helmet>
        <meta name="theme-color" content="#3eb3e5" />
      </Helmet>
      {status === "success" && (
        <Centered>
          <div className="flex flex-col items-center">Success</div>
        </Centered>
      )}
      {status === "error" && (
        <Centered>
          <div className="flex flex-col items-center">Something went wrong</div>
        </Centered>
      )}
      {(status === "initial" || status === "loading") && (
        <div className={clsx("p-7 py-10 flex flex-col h-full")}>
          <div className={clsx("")}>
            <h1 className={clsx("font-bold text-3xl mb-10")}>Multipass</h1>
          </div>
          <div className={clsx("flex-grow")} />
          <div className={clsx("pt-3 flex flex-col space-y-1 justify-center")}>
            <div className={clsx("flex flex-row justify-center")}>
              <div className={clsx("p-2")}>
                <div>Anchor one</div>
                <form onClick={handleSubmit(fetch("anchor-a"))}>
                  <input
                    {...register("anchor-a")}
                    className={clsx(
                      "p-1 border border-r-0 rounded rounded-r-none",
                    )}
                  />
                  <button
                    type="submit"
                    className={clsx(
                      "p-1 border rounded rounded-l-none bg-gray-100",
                    )}
                  >
                    Fetch
                  </button>
                </form>
                {devices["anchor-a"] &&
                  devices["anchor-a"].map((d) => (
                    <div key={d.alias} className={clsx("flex m-1")}>
                      <div>{d.alias}</div>
                      <div className={clsx("flex-1")} />
                      <button
                        onClick={() => copyDevice("anchor-b")(d)}
                        className={clsx(
                          "p-1 text-right bg-gray-100 rounded border",
                        )}
                      >
                        ↦
                      </button>
                    </div>
                  ))}
              </div>
              <div className={clsx("p-2")}>
                <div>Anchor two</div>
                <form onClick={handleSubmit(fetch("anchor-b"))}>
                  <input
                    {...register("anchor-b")}
                    className={clsx(
                      "p-1 border border-r-0 rounded rounded-r-none",
                    )}
                  />
                  <button
                    type="submit"
                    className={clsx(
                      "p-1 border rounded rounded-l-none bg-gray-100",
                    )}
                  >
                    Fetch
                  </button>
                </form>
                {devices["anchor-b"] &&
                  devices["anchor-b"].map((d) => (
                    <div key={d.alias} className={clsx("flex")}>
                      <div>{d.alias}</div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <Loader isLoading={status === "loading"} />
        </div>
      )}
    </Screen>
  )
}
