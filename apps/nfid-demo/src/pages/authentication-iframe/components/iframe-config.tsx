import { ScreenStyleParams } from "packages/ui/src/templates/screen-responsive/config"
import { useCallback, useState } from "react"
import { ChromePicker } from "react-color"

import { Button, H3, H5, Popover } from "@nfid-frontend/ui"

const initialStyleConfig = {
  frameBgColor: "",
  frameBorderColor: "",
  primaryButtonColor: "",
  secondaryButtonColor: "",
  buttonBorderColor: "",
  mainTextColor: "",
  secondaryTextColor: "",
  linkColor: "",
  checkMarkColor: "",
}

export const IframeConfig = ({
  updateStyleQuery,
  renderIframe,
}: {
  updateStyleQuery: (value: string) => void
  renderIframe: () => void
}) => {
  const [styleConfig, setStyleConfig] =
    useState<ScreenStyleParams>(initialStyleConfig)

  const onApply = useCallback(() => {
    const value = Object.entries(styleConfig)
      .map((entry) => entry[1] && `${entry[0]}=${encodeURIComponent(entry[1])}`)
      .join("&")

    updateStyleQuery(value)
    renderIframe()
  }, [renderIframe, styleConfig, updateStyleQuery])

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        <H3>Iframe configuration</H3>
        <div className="flex flex-wrap justify-between gap-10 mt-10">
          <div className="">
            <H5>Frame styles</H5>
            <div className="space-y-1.5 mt-2">
              {Object.entries(styleConfig)
                .slice(0, 2)
                .map((object) => (
                  <div className="flex">
                    <Popover
                      trigger={
                        <div
                          className="w-5 h-5 rounded-full mr-2.5 border border-black"
                          style={{
                            background: `rgb(${object[1]})`,
                          }}
                        />
                      }
                    >
                      <ChromePicker
                        color={`rgb(${object[1]})`}
                        onChange={({ rgb: { r, g, b } }) => {
                          setStyleConfig({
                            ...styleConfig,
                            [`${object[0]}`]: `${r} ${g} ${b}`,
                          })
                        }}
                      />
                    </Popover>
                    <p className="font-mono">{object[0]}</p>
                  </div>
                ))}
            </div>
          </div>
          <div className="">
            <H5>Buttons styles</H5>
            <div className="space-y-1.5 mt-2">
              {Object.entries(styleConfig)
                .slice(2, 5)
                .map((object) => (
                  <div className="flex">
                    <Popover
                      trigger={
                        <div
                          className="w-5 h-5 rounded-full mr-2.5 border border-black"
                          style={{
                            background: `rgb(${object[1]})`,
                          }}
                        />
                      }
                    >
                      <ChromePicker
                        color={`rgb(${object[1]})`}
                        onChange={({ rgb: { r, g, b } }) => {
                          setStyleConfig({
                            ...styleConfig,
                            [`${object[0]}`]: `${r} ${g} ${b}`,
                          })
                        }}
                      />
                    </Popover>
                    <p className="font-mono">{object[0]}</p>
                  </div>
                ))}
            </div>
          </div>
          <div className="">
            <H5>Text styles</H5>
            <div className="space-y-1.5 mt-2">
              {Object.entries(styleConfig)
                .slice(5, 7)
                .map((object) => (
                  <div className="flex">
                    <Popover
                      trigger={
                        <div
                          className="w-5 h-5 rounded-full mr-2.5 border border-black"
                          style={{
                            background: `rgb(${object[1]})`,
                          }}
                        />
                      }
                    >
                      <ChromePicker
                        color={`rgb(${object[1]})`}
                        onChange={({ rgb: { r, g, b } }) => {
                          setStyleConfig({
                            ...styleConfig,
                            [`${object[0]}`]: `${r} ${g} ${b}`,
                          })
                        }}
                      />
                    </Popover>
                    <p className="font-mono">{object[0]}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>
        <div className="">
          <H5>Other styles</H5>
          <div className="space-y-1.5 mt-2">
            {Object.entries(styleConfig)
              .slice(7)
              .map((object) => (
                <div className="flex">
                  <Popover
                    trigger={
                      <div
                        className="w-5 h-5 rounded-full mr-2.5 border border-black"
                        style={{
                          background: `rgb(${object[1]})`,
                        }}
                      />
                    }
                  >
                    <ChromePicker
                      color={`rgb(${object[1]})`}
                      onChange={({ rgb: { r, g, b } }) => {
                        setStyleConfig({
                          ...styleConfig,
                          [`${object[0]}`]: `${r} ${g} ${b}`,
                        })
                      }}
                    />
                  </Popover>
                  <p className="font-mono">{object[0]}</p>
                </div>
              ))}
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <Button id="updateIframe" className="ml-1.5" onClick={onApply}>
          Update Iframe
        </Button>
      </div>
    </div>
  )
}
