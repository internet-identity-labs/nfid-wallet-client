import { useState } from "react"

import { Button, IconCmpArrow, TextArea } from "@nfid-frontend/ui"

import { AuthAppMeta } from "../app-meta"

export function AuthSignInWithRecoveryPhrase({
  onBack,
  appMeta,
  withLogo,
  title,
  subTitle,
  handleAuth,
  error,
  isLoading,
}: {
  onBack: () => void
  appMeta?: string
  handleAuth: (value: string) => void
  withLogo?: boolean
  title?: string
  subTitle?: string | JSX.Element
  error?: string
  isLoading?: boolean
}) {
  const [value, setValue] = useState("")

  return (
    <div className="h-full flex-grow flex flex-col">
      <IconCmpArrow
        className="absolute w-6 transition-opacity cursor-pointer hover:opacity-50 shrink-0 top-5 left-5"
        onClick={onBack}
      />
      <AuthAppMeta
        applicationURL={appMeta}
        withLogo={withLogo}
        title={title}
        subTitle={subTitle}
      />
      <p className="text-center text-sm my-[10px]">
        Enter your recovery phrase to proceed:
      </p>
      <TextArea
        className="flex flex-grow flex-col mb-[20px]"
        areaClassName="px-[10px] py-[10px] md:px-[14px] rounded-[12px] border flex flex-grow"
        errorText={error}
        onChange={(e) => {
          setValue(e.target.value)
        }}
        value={value}
      />
      <Button
        type="primary"
        block
        onClick={() => {
          handleAuth(value)
        }}
        disabled={isLoading}
      >
        Sign in
      </Button>
    </div>
  )
}
