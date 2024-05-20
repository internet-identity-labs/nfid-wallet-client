import clsx from "clsx"
import ExternalIcon from "packages/ui/src/atoms/icons/external.svg"
import HistoryIcon from "packages/ui/src/atoms/icons/history.svg"
import RemoveIcon from "packages/ui/src/atoms/icons/trash.svg"
import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"

import { Button, Copy, DropdownSelect } from "@nfid-frontend/ui"
import { removeICRC1Canister } from "@nfid/integration/token/icrc1"
import { ICP_CANISTER_ID } from "@nfid/integration/token/icrc1/constants"

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { getLambdaCredentials } from "frontend/integration/lambda/util/util"
import { ApplicationIcon } from "frontend/ui/atoms/application-icon"
import { TrashIcon } from "frontend/ui/atoms/icons/trash"
import { Loader } from "frontend/ui/atoms/loader"
import { AssetFilter, Blockchain } from "frontend/ui/connnector/types"
import { BlurredLoader } from "frontend/ui/molecules/blurred-loader"
import { ModalComponent } from "frontend/ui/molecules/modal/index-v0"
import ProfileContainer from "frontend/ui/templates/profile-container/Container"
import ProfileTemplate from "frontend/ui/templates/profile-template/Template"

import { ProfileAssetsHeader } from "./header"
import Icon from "./transactions.svg"

type Token = {
  toPresentation: (amount?: bigint) => number
  icon: string
  title: string
  currency: string
  balance?: bigint
  price?: string
  blockchain: Blockchain
  canisterId?: string
}

type TokenToRemove = {
  canisterId: string
  name: string
}

interface IProfileAssetsPage extends React.HTMLAttributes<HTMLDivElement> {
  onIconClick: () => void
  tokens: Token[]
  assetFilter: AssetFilter[]
  setAssetFilter: (value: AssetFilter[]) => void
  isLoading?: boolean
}

const ProfileAssetsPage: React.FC<IProfileAssetsPage> = ({
  onIconClick,
  tokens,
  isLoading,
}) => {
  const [tokenToRemove, setTokenToRemove] = useState<TokenToRemove | null>(null)
  const [isRemoveLoading, setIsRemoveLoading] = useState(false)

  const navigate = useNavigate()

  const navigateToTransactions = React.useCallback(
    (canisterId: string) => () => {
      navigate(`${ProfileConstants.base}/${ProfileConstants.transactions}`, {
        state: {
          canisterId,
        },
      })
    },
    [navigate],
  )

  console.debug("ProfileAssetsPage", { tokens })

  const removeHandler = async () => {
    setIsRemoveLoading(true)
    try {
      const { rootPrincipalId } = await getLambdaCredentials()
      if (!rootPrincipalId || !tokenToRemove) return
      await removeICRC1Canister(rootPrincipalId, tokenToRemove.canisterId)
      toast.success(
        <p className="font-semibold text-black">
          {tokenToRemove.name} has been removed.
        </p>,
      )
    } catch (e) {
      console.error("removeICRC1Canister", e)
    } finally {
      setTokenToRemove(null)
      setIsRemoveLoading(false)
    }
  }

  return (
    <ProfileTemplate
      pageTitle="Assets"
      icon={Icon}
      iconTooltip="Activity history"
      onIconClick={onIconClick}
      iconId="activity"
      className="overflow-inherit"
    >
      <ProfileContainer
        title={<ProfileAssetsHeader />}
        showChildrenPadding={false}
        className="mb-10 sm:pb-0 "
      >
        <div className="px-5">
          <Loader isLoading={!tokens.length!} />
          <table className={clsx("text-left w-full hidden sm:table")}>
            <thead className={clsx("border-b border-black  h-16")}>
              <tr className={clsx("font-bold text-sm leading-5")}>
                <th>Name</th>
                <th className="text-right">Token balance</th>
                <th className="text-right pr-[22px]">USD balance</th>
                <th className="px-[10px] w-[44px]"></th>
              </tr>
            </thead>
            <tbody className="h-16 text-sm text-[#0B0E13]">
              {tokens.map((token, index) => (
                <tr
                  key={`token_${index}`}
                  id={`token_${token.title.replace(/\s+/g, "")}`}
                  className="border-b border-gray-200 cursor-pointer last:border-b-0 hover:bg-gray-100"
                >
                  <td className="flex items-center h-16">
                    <ApplicationIcon
                      className="mr-[18px]"
                      icon={token.icon}
                      appName={token.title}
                    />
                    <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                      <p
                        className="text-sm font-bold w-[150px]"
                        id={`token_${token.title.replace(/\s/g, "")}_currency`}
                      >
                        {token.currency}
                      </p>
                      <p
                        className={
                          "text-[#9CA3AF] text-xs items-left flex w-[150px]"
                        }
                      >
                        {token.title}
                      </p>
                    </div>
                  </td>
                  <td
                    className="text-sm text-right"
                    id={`token_${token.title.replace(/\s/g, "")}_balance`}
                  >
                    <span className="overflow-hidden text-ellipsis whitespace-nowrap w-[150px]">
                      {token.toPresentation(token.balance)} {token.currency}
                    </span>
                  </td>
                  <td
                    className="text-sm text-right pr-[20px]"
                    id={`token_${token.title.replace(/\s/g, "")}_usd`}
                  >
                    {token.price ? token.price : "Not listed"}
                  </td>
                  <td className="px-[10px] text-sm text-right">
                    <DropdownSelect
                      isToken={true}
                      options={
                        [
                          {
                            label: "Transactions",
                            icon: HistoryIcon,
                            value: token.currency,
                            handler: navigateToTransactions(token.canisterId!),
                          },
                          {
                            element: (
                              <Copy
                                iconClassName="w-6"
                                isTokenMenu={true}
                                value={token.canisterId || ICP_CANISTER_ID}
                                copyTitle="Copy token address"
                              />
                            ),
                            value: "",
                          },
                          {
                            label: "View on block explorer",
                            icon: ExternalIcon,
                            value: `https://dashboard.internetcomputer.org/canister/${
                              token.canisterId || ICP_CANISTER_ID
                            }`,
                          },
                          {
                            label: "Remove token",
                            icon: RemoveIcon,
                            value: token.canisterId!,
                            handler: () =>
                              setTokenToRemove({
                                canisterId: token.canisterId!,
                                name: token.title,
                              }),
                          },
                        ] ?? []
                      }
                      selectedValues={[]}
                      setSelectedValues={() => console.log(1)}
                      isMultiselect={false}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <ModalComponent
            isVisible={Boolean(tokenToRemove)}
            onClose={() => setTokenToRemove(null)}
            className="p-5 w-[95%] md:w-[540px] z-[100] rounded-xl"
          >
            <BlurredLoader isLoading={isRemoveLoading} />
            <p className="text-2xl font-bold mb-[20px]">Remove token</p>
            <div className="flex items-center gap-[20px]">
              <div
                style={{
                  backgroundImage:
                    "linear-gradient(to bottom right, rgba(220, 38, 38, 0.08), rgb(255, 255, 255))",
                  //"linear-gradient(to bottom right, rgba(220, 38, 38, 0.6), rgb(220, 38, 38, 0))",
                }}
                className="flex flex-[0 0 70px] justify-center items-center min-w-[70px] h-[70px] rounded-[24px] hidden sm:flex"
              >
                <TrashIcon className="text-red h-[38px] w-[38px] text-red-500" />
              </div>

              <p className="text-sm">
                Are you sure you want to remove{" "}
                <span className="font-semibold">{tokenToRemove?.name}</span>?
                Your balance will remain if you re-add this token in the future.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-2.5 mt-5">
              <Button
                className="min-w-[120px]"
                type="stroke"
                onClick={() => setTokenToRemove(null)}
              >
                Cancel
              </Button>
              <Button
                className="min-w-[120px]"
                type="red"
                onClick={removeHandler}
              >
                Remove
              </Button>
            </div>
          </ModalComponent>
          <div className="sm:hidden">
            {tokens.map((token, index) => (
              <div
                key={`token_${index}`}
                className="flex items-center justify-between h-16"
              >
                <div className="flex items-center text-[#0B0E13]">
                  <ApplicationIcon
                    className="w-6 h-6 mr-[13px]"
                    icon={token.icon}
                    appName={token.title}
                  />
                  <div className="text-ellipsis whitespace-nowrap overflow-hidden w-[150px]">
                    <p className="text-sm font-bold leading-5">{token.title}</p>
                    <p className="text-[#9CA3AF] text-xs items-left flex leading-3">
                      {token.currency}
                    </p>
                  </div>
                </div>
                <div className="text-right ml-auto mr-[20px]">
                  <div className="text-sm leading-5 text-ellipsis whitespace-nowrap overflow-hidden w-[70px]">
                    {token.toPresentation(token.balance)} {token.currency}
                  </div>
                  <div className="text-xs leading-3 text-gray-400">
                    {token.price}
                  </div>
                </div>
                <div className="w-auto">
                  <DropdownSelect
                    isToken={true}
                    options={
                      [
                        {
                          label: "Transactions",
                          icon: HistoryIcon,
                          value: token.currency,
                          handler: navigateToTransactions(token.canisterId!),
                        },
                        {
                          element: (
                            <Copy
                              iconClassName="w-6"
                              isTokenMenu={true}
                              value={token.canisterId || ICP_CANISTER_ID}
                              copyTitle="Copy token address"
                            />
                          ),
                          value: "",
                        },
                        {
                          label: "View on block explorer",
                          icon: ExternalIcon,
                          value: `https://dashboard.internetcomputer.org/canister/${
                            token.canisterId || ICP_CANISTER_ID
                          }`,
                        },
                        {
                          label: "Remove token",
                          icon: RemoveIcon,
                          value: token.canisterId!,
                          handler: () =>
                            setTokenToRemove({
                              canisterId: token.canisterId!,
                              name: token.title,
                            }),
                        },
                      ] ?? []
                    }
                    selectedValues={[]}
                    setSelectedValues={() => console.log(1)}
                    isMultiselect={false}
                  />
                </div>
              </div>
            ))}
          </div>
          {tokens?.length && isLoading ? (
            <div className="flex items-center justify-center w-full h-16 border-t border-gray-200">
              <Loader
                isLoading={true}
                fullscreen={false}
                imageClasses="w-10 h-10"
              />
            </div>
          ) : null}
        </div>
      </ProfileContainer>
    </ProfileTemplate>
  )
}

export default ProfileAssetsPage
