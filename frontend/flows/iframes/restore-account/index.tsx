import { H5 } from "components/atoms/typography"
import { IFrameScreen } from "frontend/design-system/templates/IFrameScreen"
import { Button, Input } from "frontend/ui-kit/src"
import { anchorRules } from "frontend/utils/validations"
import React from "react"
import { useForm } from "react-hook-form"

interface IFrameRestoreAccessPointStartProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const IFrameRestoreAccessPointStart: React.FC<
  IFrameRestoreAccessPointStartProps
> = ({ children, className }) => {
  const {
    register,
    formState: { errors, isValid },
    resetField,
    handleSubmit,
  } = useForm({
    mode: "all",
  })

  return (
    <IFrameScreen>
      <H5 className="text-center mb-4">Log in to your NFID</H5>

      <div className="text-center">
        Is this access point already registered? <br />
        Log in with your NFID Number:
      </div>

      <Input
        small
        autoFocus
        errorText={errors.anchor?.message}
        className="mt-4 mb-6"
        {...register("anchor", {
          required: anchorRules.errorMessages.required,
          pattern: {
            value: anchorRules.regex,
            message: anchorRules.errorMessages.pattern,
          },
          minLength: {
            value: anchorRules.minLength,
            message: anchorRules.errorMessages.length,
          },
        })}
      />

      <Button secondary block>
        Log in with NFID Number
      </Button>

      <Button text block className="mt-2">
        Other login options
      </Button>
    </IFrameScreen>
  )
}
