import clsx from "clsx"
import React from "react"
import { FieldValues, useForm } from "react-hook-form"

import { Button, Loader, TextArea } from "@nfid-frontend/ui"
import { formatSeedPhrase } from "@nfid-frontend/utils"

import { CONTAINER_CLASSES } from "../../atoms/container"
import { AppScreen } from "../../templates/app-screen/AppScreen"

import bgPicture from "./recovery-background.png"

interface RecoverNFIDProps extends React.HTMLAttributes<HTMLDivElement> {
  onRecover: (data: FieldValues) => {}
  toggle: () => void
  isVerifiedDomain?: boolean
  isLoading: boolean
  responseError?: any
}

export const RecoverNFID: React.FC<RecoverNFIDProps> = ({
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

  const handleRecoveryPhraseChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    event.target.value = formatSeedPhrase(event.target.value)
  }

  return (
    <AppScreen isFocused showLogo>
      <main className={clsx("flex flex-1")}>
        <div className={clsx(CONTAINER_CLASSES)}>
          <div
            className={clsx(
              "px-[20px] sm:px-[30px] py-[20px] sm:py-[33px] bg-zinc-50 rounded-[24px]",
              "bg-no-repeat bg-[top_right] lg:bg-[center_right] bg-[length:260px] sm:bg-[length:50%] lg:bg-[length:445px]",
            )}
            style={{
              backgroundImage: `url(${bgPicture})`,
            }}
          >
            <div className="max-w-[605px]">
              <p className="leading-[32px] text-[28px] my-[84px] lg:my-0">
                Recover NFID
              </p>
              <div className="mb-[10px] mt-[20px] text-sm">
                Enter your recovery phrase to proceed:
              </div>
              <TextArea
                rows={7}
                errorText={errors?.recoveryPhrase?.message}
                {...register("recoveryPhrase", {
                  required: {
                    value: true,
                    message: "Please enter your Recovery Phrase",
                  },
                  onChange: handleRecoveryPhraseChange,
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
                <label
                  htmlFor="has-verified-domain"
                  className="pr-5 ml-2 text-sm"
                >
                  I got to this screen by first going to https://nfid.one, being
                  redirected to this landing page, and following the link to
                  recover my NFID.
                </label>
              </div>

              <Button
                className={clsx(
                  "mt-4 px-[50px] w-full sm:w-auto",
                  !isVerifiedDomain && "!bg-zinc-300",
                )}
                id="recovery-button"
                onClick={handleSubmit(onRecover)}
                disabled={!isVerifiedDomain}
              >
                Recover
              </Button>
            </div>
            <Loader isLoading={isLoading} />
          </div>
        </div>
      </main>
    </AppScreen>
  )
}
