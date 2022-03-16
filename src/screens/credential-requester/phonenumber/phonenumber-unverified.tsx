import React from "react"
import { Input, Button } from "frontend/ui-kit/src"
import { phoneRules } from "frontend/utils/validations"
import { useForm } from "react-hook-form"

interface PhonenumberUnverifiedProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  iframe?: boolean
}

export const PhonenumberUnverified: React.FC<PhonenumberUnverifiedProps> = ({
  children,
  className,
  iframe,
}) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({
    mode: "onTouched",
  })

  const handleVerifyPhonenumber = React.useCallback(async (data: any) => {
    const { phonenumber } = data

    console.log("phonenumber :>> ", phonenumber)
  }, [])

  return (
    <div>
      <div>You haven't yet verified your phone number.</div>
      <div className="mt-3 mb-5">
        Would you like to verify it now? Your phone number is never shared with
        anyone and only accessible to you.
      </div>

      <Input
        small
        type="tel"
        placeholder="+XX XXX XXX XX XX"
        labelText="Phone number"
        errorText={errors.phonenumber?.message}
        {...register("phonenumber", {
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

      <Button
        secondary
        block={iframe}
        large={!iframe}
        onClick={handleSubmit(handleVerifyPhonenumber)}
        className="mt-4"
      >
        Verify phone number
      </Button>

      <Button text block>
        Skip for now
      </Button>
    </div>
  )
}
