import clsx from "clsx"
import React from "react"
import { IoMdArrowBack } from "react-icons/io"
import { Link } from "react-router-dom"
import ReactCodeInput from "react-verification-code-input"

import { P, Logo, H4, Button } from "@internet-identity-labs/nfid-sdk-react"

import { AppScreen } from "frontend/design-system/templates/AppScreen"

import { useTimer } from "frontend/hooks/use-timer"

interface Account {
  anchor: string
  name?: string
}

interface ProfileEditPhoneSmsProps {
  account?: Account
  onResendCode: () => void
}

export const ProfileEditPhoneSms: React.FC<ProfileEditPhoneSmsProps> = ({
  account,
  onResendCode,
}) => {
  console.log(account)
  const { counter, setCounter } = useTimer({ defaultCounter: 3 })

  const handleResend = () => {
    onResendCode && onResendCode()
    setCounter(60)
  }

  return (
    <AppScreen
      bubbleOptions={{
        showBubbles: true,
        bubbleColors: ["#a69cff", "#4df1ffa8"],
        bubbleClassNames: [
          "md:top-[40vh] md:left-[10vw]",
          "top-[20vh] left-[27vw] md:top-[60vh] md:left-[10vw]",
        ],
      }}
      navigationBar={false}
    >
      <main
        className={clsx(
          "w-full grid relative h-screen grid-rows-[100px_1fr]",
          "sm:grid-cols-[1fr,3fr] sm:grid-rows-none",
        )}
      >
        <div className="pt-5 pl-7">
          <Logo />
        </div>
        <div
          className={clsx(
            "relative py-6 px-5 bg-white flex flex-col",
            "sm:pr-[25%] sm:pl-24 sm:block",
          )}
        >
          <Link
            to={"/profile/authenticate"}
            className={clsx(
              "transition-opacity cursor-pointer top-8 left-10 hover:opacity-40",
              "sm:absolute",
            )}
          >
            <IoMdArrowBack className="w-5 h-5 text-black" />
          </Link>
          <H4 className="mt-5 sm:mt-0">SMS verification</H4>
          <P className="mt-3 text-sm sm:mt-14">
            Please enter the verification code that was sent to +1 234 856 7890.
            <br />
            {counter > 0 ? (
              <P className="mt-3">Code can be resent in {counter} sec</P>
            ) : (
              <P className="mt-3">
                Didn’t receive a code?{" "}
                <span
                  className="cursor-pointer text-blue-base"
                  onClick={handleResend}
                >
                  Resend
                </span>
              </P>
            )}
          </P>
          <form
            className={clsx(
              "mt-5 flex flex-col justify-between flex-1",
              "sm:block",
            )}
          >
            <div className="flex flex-row space-x-2.5">
              <ReactCodeInput />
            </div>
            <Button secondary className="px-10 sm:mt-5">
              Complete
            </Button>
          </form>
        </div>
      </main>
    </AppScreen>
  )
}
