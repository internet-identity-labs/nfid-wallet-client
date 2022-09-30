import clsx from "clsx"
import React, { Dispatch, SetStateAction } from "react"
import { SubmitHandler, useForm } from "react-hook-form"

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { Button } from "frontend/ui/atoms/button"
import { Input } from "frontend/ui/atoms/input"
import ProfileContainer from "frontend/ui/templates/profile-container/Container"
import ProfileTemplate from "frontend/ui/templates/profile-template/Template"
import { phoneRules } from "frontend/ui/utils/validations"

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
      onBack={`${ProfileConstants.base}/${ProfileConstants.credentials}`}
      isLoading={isLoading}
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
              className="text-blue-600 transition-opacity cursor-pointer hover:opacity-75"
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
              onKeyUp={() => setResponseError && setResponseError("")}
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
            primary
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
