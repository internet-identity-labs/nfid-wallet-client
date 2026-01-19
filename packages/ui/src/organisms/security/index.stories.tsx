import { Meta, StoryFn } from "@storybook/react"
import clsx from "clsx"
import { useState } from "react"

import {
  IconCmpDesktop,
  IconCmpDots,
  IconCmpPlus,
  IconCmpTrash,
} from "@nfid-frontend/ui"

import { DocumentIcon } from "../../atoms/icons/document"
import { GoogleIcon } from "../../atoms/icons/google"

import { Toggle } from "../../atoms/toggle"
import { Security, SecurityProps } from "./index"

const MockPrimarySignInElement = () => (
  <>
    <div className="flex space-x-2.5 items-center">
      <div className="w-10 h-10 p-2 rounded-full">
        <GoogleIcon color="#9CA3AF" />
      </div>
      <div>
        <p className="text-sm leading-[23px]">example@email.com</p>
        <p className="text-xs leading-5 text-gray-400">Google sign in</p>
      </div>
    </div>
  </>
)
const MockAddPasskeyElement = () => (
  <div
    className={clsx(
      "flex items-center space-x-2.5 pl-2.5 h-[40px] text-primaryButtonColor",
      "hover:opacity-50 cursor-pointer transition-opacity mt-[20px]",
    )}
    onClick={() => console.log("Add passkey button clicked")}
  >
    <IconCmpPlus className="w-[18px] h-[18px]" />
    <span className="text-sm font-bold">Add Passkey</span>
  </div>
)
const MockRenderPasskeys = () => (
  <tr>
    <td className="flex h-[61px] items-center">
      <div className="flex items-center w-[24px] h-[24px] shrink-0 ml-2 mr-[26px]">
        <IconCmpDesktop color="#9CA3AF" />
      </div>
      <div>
        <p className="leading-[26px]">Chrome on Windows</p>
        <p className="text-xs text-gray-400 leading-[16px]">example.com</p>
      </div>
    </td>
    <td className="hidden sm:table-cell">2024-08-21</td>
    <td className="hidden sm:table-cell">2024-08-21</td>
    <td>
      <div className="relative w-6 shrink-0">
        <IconCmpDots
          className="cursor-pointer text-secondary hover:text-black shrink-0"
          onClick={() => console.log("Remove Recovery button clicked")}
        />
      </div>
    </td>
  </tr>
)
const MockRenderRecoveryOptions = () => (
  <div>
    <div className="flex items-center justify-between">
      <div className="flex space-x-2.5 items-center">
        <div className="w-10 h-10 p-2 rounded-full">
          <DocumentIcon color="#9CA3AF" />
        </div>
        <div>
          <p className="text-sm leading-5">Recovery phrase</p>
          <p className="text-xs leading-4 text-gray-400">
            Last activity: Apr 17, 2024
          </p>
        </div>
      </div>
      <IconCmpTrash
        onClick={() => console.log("Remove Recovery button clicked")}
      />
    </div>
  </div>
)

const meta: Meta = {
  title: "Pages/Security",
  component: Security,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
    layout: "fullscreen",
  },
}

export default meta

export const Default: StoryFn<SecurityProps> = (args) => {
  const [isChecked, setIsChecked] = useState(false)
  return (
    <div className="p-[30px]">
      <Security
        {...args}
        toggleElement={
          <Toggle
            isChecked={isChecked}
            onToggle={() => {
              setIsChecked(!isChecked)
              console.log(`Toggle switched ${!isChecked ? "on" : "off"}`)
            }}
          />
        }
      />
    </div>
  )
}

Default.args = {
  primarySignInElement: <MockPrimarySignInElement />,
  addPasskeyElement: <MockAddPasskeyElement />,
  renderPasskeys: MockRenderPasskeys,
  renderRecoveryOptions: MockRenderRecoveryOptions,
}
