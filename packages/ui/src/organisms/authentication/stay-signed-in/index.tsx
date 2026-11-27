import { AuthAppMeta } from "packages/ui/src/organisms/authentication/app-meta"
import { JSX } from "react"

import { Button } from "@nfid-frontend/ui"

import Img from "./stay-sign-in.png"

export const StaySignedIn = ({
  applicationURL,
  onStaySignedIn,
  onDoNotStaySignedIn,
  isLoading,
  withLogo,
  title,
  subTitle,
  isIdentityKit,
}: {
  applicationURL?: string
  onStaySignedIn: () => void
  onDoNotStaySignedIn: () => void
  isLoading?: boolean
  withLogo?: boolean
  title?: string
  subTitle?: string | JSX.Element
  isIdentityKit?: boolean
}) => {
  return (
    <div className="flex flex-col flex-grow h-full font-inter">
      <AuthAppMeta
        applicationURL={applicationURL}
        withLogo={withLogo}
        title={title}
        subTitle={subTitle}
        isIdentityKit={isIdentityKit}
        classnames="!pb-[14px]"
      />
      <div className="flex flex-col flex-1">
        {!isIdentityKit && (
          <p className="font-bold leading-6 tracking-[0.16px] pb-1 dark:text-white text-center">
            Stay signed in
          </p>
        )}
        <p className="text-center text-sm mb-[10px] dark:text-white px-1">
          By clicking 'Stay signed in', you can stay signed in on this device.
          To end your session, simply sign out of your account.
        </p>
        <img src={Img} className="my-auto" alt="Stay signed in" />

        <Button
          className="mt-auto mb-2"
          block
          disabled={isLoading}
          onClick={onStaySignedIn}
          type="primary"
        >
          Stay signed in
        </Button>
        <Button
          block
          disabled={isLoading}
          onClick={onDoNotStaySignedIn}
          type="stroke"
        >
          Not now
        </Button>
      </div>
    </div>
  )
}
