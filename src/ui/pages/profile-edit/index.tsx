import clsx from "clsx"
import React from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { BsPlusLg } from "react-icons/bs"
import { IoMdArrowBack } from "react-icons/io"
import { Link } from "react-router-dom"

import {
  P,
  Logo,
  H4,
  Input,
  Button,
} from "@internet-identity-labs/nfid-sdk-react"

import { Profile } from "frontend/integration/identity-manager"
import { AppScreen } from "frontend/ui/templates/app-screen/AppScreen"
import { nameRules } from "frontend/ui/utils/validations"

interface ProfileEditProps {
  account?: Profile
  onSubmit: SubmitHandler<{ name: string | undefined }>
  onAddPhoneNumber: () => Promise<void> | void
  isLoading?: boolean
}

export const ProfileEdit: React.FC<ProfileEditProps> = ({
  account,
  onSubmit,
  onAddPhoneNumber,
  isLoading = false,
}) => {
  const {
    formState: { errors },
    register,
    handleSubmit,
  } = useForm({
    defaultValues: {
      name: account?.name,
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
      isLoading={isLoading}
      profileScreen
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
          <H4 className="mt-5 sm:mt-0">Edit account</H4>
          <P className="mt-3 text-sm sm:mt-14">
            Only you and your devices have access to this data. Read more about
            your privacy in our{" "}
            <a
              className="text-blue-base hover:underline"
              href="/faq"
              target="_blank"
            >
              FAQ
            </a>
            .
          </P>
          <form
            className={clsx(
              "mt-5 flex flex-col justify-between flex-1",
              "sm:block",
            )}
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="space-y-2">
              <Input
                type="text"
                errorText={errors.name?.message}
                {...register("name", {
                  required: nameRules.errorMessages.required,
                  pattern: {
                    value: nameRules.regex,
                    message: nameRules.errorMessages.pattern,
                  },
                  minLength: {
                    value: nameRules.minLength,
                    message: nameRules.errorMessages.length,
                  },
                  maxLength: {
                    value: nameRules.maxLength,
                    message: nameRules.errorMessages.length,
                  },
                })}
                labelText="Full name"
                pattern="[A-Za-z]"
                onChange={(e) => {
                  const oldValue = e.target.value
                  e.target.value = oldValue.replace(/[^a-z ]/gi, "")
                }}
              />
              {/* Commented phone input field */}
              {account?.phoneNumber ? (
                <Input
                  type="tel"
                  labelText="Hashed phone number"
                  disabled
                  value={account.phoneNumber}
                />
              ) : (
                <div
                  className="flex items-center py-2 space-x-2 font-semibold transition-all cursor-pointer text-blue-base hover:opacity-50"
                  onClick={onAddPhoneNumber}
                >
                  <BsPlusLg />
                  <span>Add phone number</span>
                </div>
              )}
            </div>
            <Button
              secondary
              className="px-10 sm:mt-5"
              onClick={handleSubmit(onSubmit)}
            >
              Save changes
            </Button>
          </form>
        </div>
      </main>
    </AppScreen>
  )
}
