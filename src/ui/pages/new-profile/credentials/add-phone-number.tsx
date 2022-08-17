import clsx from "clsx"
import React from "react"
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
}

const ProfileAddPhoneNumber: React.FC<IProfileAddPhoneNumber> = ({
  responseError,
  onSubmit,
  isLoading,
}) => {
  const {
    formState: { errors },
    register,
    handleSubmit,
    setError,
  } = useForm<{ phone: string }>({
    defaultValues: {
      phone: "",
    },
  })

  React.useEffect(() => {
    if (responseError && errors.phone?.message !== responseError) {
      setError("phone", { message: responseError })
    }
  }, [errors.phone, responseError, setError])

  return (
    <ProfileTemplate
      pageTitle="Add phone number"
      onBack={`${ProfileConstants.credentials}`}
      isLoading={isLoading}
    >
      <ProfileContainer subTitle="Verify your phone number with NFID. Standard text messaging rates may apply.">
        <form
          className={clsx("mt-5 flex flex-col flex-1", "sm:block")}
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="space-y-2">
            <Input
              className="max-w-[350px]"
              labelText="Phone number"
              errorText={errors.phone?.message}
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
