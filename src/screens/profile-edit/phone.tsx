import clsx from "clsx"
import React from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { IoMdArrowBack } from "react-icons/io"
import { Link } from "react-router-dom"

import { P, Logo, H4, Button } from "@internet-identity-labs/nfid-sdk-react"

import { Input } from "frontend/design-system/atoms/input"
import { AppScreen } from "frontend/design-system/templates/AppScreen"

import { phoneRules } from "frontend/utils/validations"

interface Account {
  anchor: string
  name?: string
  phone?: string
}

interface ProfileEditProps {
  account?: Account
  onSubmit: SubmitHandler<{ phone: string | undefined }>
}

export const ProfileEditPhone: React.FC<ProfileEditProps> = ({
  account,
  onSubmit,
}) => {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      phone: account?.phone,
    },
  })

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
          <H4 className="mt-5 sm:mt-0">Add phone number</H4>
          <P className="mt-3 text-sm sm:mt-14">
            Verify your phone number with NFID. Standard text messaging rates
            may apply.
          </P>
          <form
            className={clsx("mt-5 flex flex-col flex-1", "sm:block")}
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="space-y-2">
              <Input
                type="number"
                {...register("phone", {
                  required: phoneRules.errorMessages.required,
                  pattern: {
                    value: phoneRules.regex,
                    message: phoneRules.errorMessages.pattern,
                  },
                  minLength: {
                    value: phoneRules.minLength,
                    message: phoneRules.errorMessages.length,
                  },
                  maxLength: {
                    value: phoneRules.maxLength,
                    message: phoneRules.errorMessages.length,
                  },
                })}
                labelText="Phone number"
              />
            </div>
            <Button primary className="px-10 mt-3 sm:mt-5" type="submit">
              Verify phone number
            </Button>
          </form>
        </div>
      </main>
    </AppScreen>
  )
}
