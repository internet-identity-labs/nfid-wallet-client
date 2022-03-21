import React from "react"

import { AuthContext } from "./AuthContext"

export const ToggleMode = () => {
  const { isIframeMode, setIsIframeMode, setIsIframeOpened } =
    React.useContext(AuthContext)

  const validateToggle = (e: any) => {
    if (navigator.userAgent.indexOf("Chrome") === -1) {
      return alert("Sorry, but iframe mode available only for Google Chrome")
    }
    setIsIframeMode(e.target.checked)
    setIsIframeOpened(e.target.checked)
  }

  return (
    <div className="absolute top-0 left-0 p-4 sm:top-0">
      <div className="flex items-center justify-center w-full mb-12">
        <label htmlFor="mode" className="flex items-center cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              id="mode"
              className="sr-only"
              checked={isIframeMode}
              onChange={validateToggle}
            />
            <div className="block h-8 bg-gray-600 rounded-full w-14"></div>
            <div className="absolute w-6 h-6 transition bg-white rounded-full dot left-1 top-1"></div>
          </div>
          <div className="ml-3 font-medium text-gray-700">IFrame mode</div>
        </label>
      </div>
    </div>
  )
}
