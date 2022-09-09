import clsx from "clsx"
import React from "react"
import { FieldValues, useForm } from "react-hook-form"

import { Button } from "frontend/ui/atoms/button"
import { CONTAINER_CLASSES } from "frontend/ui/atoms/container"
import { TextArea } from "frontend/ui/atoms/input/text-area"
import { Loader } from "frontend/ui/atoms/loader"
import { H2 } from "frontend/ui/atoms/typography"
import { AppScreen } from "frontend/ui/templates/app-screen/AppScreen"

interface RecoverNFIDProps extends React.HTMLAttributes<HTMLDivElement> {
  onRecover: (data: FieldValues) => {}
  toggle: () => void
  isVerifiedDomain?: boolean
  isLoading: boolean
  responseError?: any
}

export const RecoverNFID: React.FC<RecoverNFIDProps> = ({
  className,
  toggle,
  isVerifiedDomain,
  onRecover,
  isLoading,
  responseError,
}) => {
  const {
    register,
    formState: { errors },
    setError,
    handleSubmit,
  } = useForm<{ recoveryPhrase: string }>({
    mode: "all",
  })

  React.useEffect(() => {
    if (responseError) {
      setError("recoveryPhrase", {
        type: "manual",
        message: responseError,
      })
    }
  }, [responseError, setError])

  return (
    <AppScreen isFocused showLogo>
      <main className={clsx("flex flex-1")}>
        <div className={clsx(CONTAINER_CLASSES)}>
          <div className="grid h-full grid-cols-12">
            <div className="flex flex-col col-span-12 md:col-span-11 lg:col-span-7">
              <div className={clsx("", className)}>
                <div>
                  <H2 className="mb-4">Recover NFID</H2>

                  <div className={clsx("mb-6")}>
                    Paste your recovery phrase here to proceed:
                  </div>

                  <TextArea
                    rows={6}
                    errorText={errors?.recoveryPhrase?.message}
                    {...register("recoveryPhrase", {
                      required: {
                        value: true,
                        message: "Please enter your Recovery Phrase",
                      },
                    })}
                  />
                  <div>
                    <input
                      type="checkbox"
                      id="has-verified-domain"
                      className="rounded"
                      onChange={toggle}
                      checked={isVerifiedDomain}
                    />
                    <label htmlFor="has-verified-domain" className="ml-2">
                      I got to this screen by first going to https://nfid.one,
                      being redirected to this landing page, and following the
                      link to recover my NFID.
                    </label>
                  </div>

                  <Button
                    primary
                    large
                    className="my-4"
                    onClick={handleSubmit(onRecover)}
                    disabled={!isVerifiedDomain}
                  >
                    Recover
                  </Button>

                  <Loader isLoading={isLoading} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </AppScreen>
  )
}
