import clsx from "clsx"
import ProfileContainer from "packages/ui/src/atoms/profile-container/Container"
import React, { Dispatch, SetStateAction } from "react"
import { SubmitHandler, useForm } from "react-hook-form"

import { Button, Input, phoneRules } from "@nfid-frontend/ui"

import ProfileTemplate from "frontend/ui/templates/profile-template/Template"

interface IProfileAddPhoneNumber {
  responseError?: string
  isLoading?: boolean
  onSubmit: SubmitHandler<{ phone: string }>
  setResponseError?: Dispatch<SetStateAction<string>>
}

const ProfileAddPhoneNumber: React.FC<IProfileAddPhoneNumber> = ({
  isLoading,
  onSubmit,
  responseError,
  setResponseError,
}) => {
  const {
    formState: { errors },
    register,
    handleSubmit,
    setError,
  } = useForm<{ phone: string }>({
    mode: "all",
  })

  React.useEffect(() => {
    if (responseError && errors.phone?.message !== responseError) {
      setError("phone", { message: responseError })
    }
  }, [errors.phone, responseError, setError])

  return (
    <ProfileTemplate
      pageTitle="Add phone number"
      isLoading={isLoading}
      showBackButton
    >
      <ProfileContainer>
        <div className={clsx("text-sm")}>
          <p>
            Verify your non-VOIP mobile phone number with NFID. Standard text
            messaging rates may apply.
          </p>
          <p className="mt-3 max-w-[766px]">
            Your phone number can only be registered with one identity. To
            register it with your existing Internet Identity anchor please see
            these{" "}
            <a
              className="transition-opacity cursor-pointer text-blue hover:opacity-75"
              href="https://docs.nfid.one/sign-in-with-ii-and-nfid"
              target="_blank"
              rel="noreferrer"
            >
              instructions
            </a>
            .
          </p>
        </div>
        <form
          className={clsx("mt-5 flex flex-col flex-1", "sm:block")}
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="space-y-2">
            <Input
              id="phone-number"
              className="max-w-[350px]"
              labelText="Phone number"
              placeholder="+1 234 856 7890"
              errorText={errors.phone?.message}
              onKeyUp={() => setResponseError?.("")}
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
            />
          </div>
          <Button
            id="add-phone-number"
            className="px-10 mt-3 sm:mt-5"
            onClick={handleSubmit(onSubmit)}
          >
            Verify phone number
          </Button>
        </form>
      </ProfileContainer>
    </ProfileTemplate>
  )
}

export default ProfileAddPhoneNumber
