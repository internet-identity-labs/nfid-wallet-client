import { FC, memo, useEffect, useState } from "react"
import { Button, CopyAddress, NotFound } from "@nfid-frontend/ui"

import { memberCreatedToDate } from "../utils"
import { PencilIcon } from "packages/ui/src/atoms/icons/pencil"
import { RangeSlider } from "packages/ui/src/atoms/range-slider"
import { IconWallet } from "packages/ui/src/atoms/icons/wallet"
import clsx from "clsx"
import { PlusIcon } from "packages/ui/src/atoms/icons/plus"
import { PolicyUpdateModal } from "../components/policy-modal"

import { PolicyUpdateType, VaultPolicyProps } from "../types"
import { VaultMember } from "@nfid/vaults"
import { VaultPolicySkeleton } from "packages/ui/src/atoms/skeleton/vault-policy-skeleton"
import { VaultPolicyInfo } from "../components/policy-info"

export const VaultPolicy: FC<VaultPolicyProps> = memo(
  ({
    validateAddress,
    updateQuorum,
    addMember,
    removeMember,
    updateMember,
    isLoading,
    vault,
  }) => {
    const [modalType, setModaltype] = useState<PolicyUpdateType | null>(null)
    const [selectedMember, setSelectedMember] = useState<
      VaultMember | undefined
    >()
    const [approversQuantity, setApproversQuantity] = useState<
      number | undefined
    >()

    useEffect(() => {
      if (vault === undefined || modalType === undefined) return

      setApproversQuantity(vault.state.quorum.quorum)
    }, [vault, modalType])

    if (isLoading) return <VaultPolicySkeleton />
    if (!vault) return <NotFound hideNavigation />
    const { state } = vault

    return (
      <>
        <PolicyUpdateModal
          isOpen={modalType !== null}
          onClose={() => setModaltype(null)}
          type={modalType}
          setType={setModaltype}
          validateAddress={validateAddress}
          addMember={addMember}
          updateQuorum={updateQuorum}
          updateMember={updateMember}
          removeMember={removeMember}
          selectedMember={selectedMember}
          approversCurrentQuantity={vault.state.quorum.quorum}
          approversQuantity={approversQuantity}
          setApproversQuantity={setApproversQuantity}
          membersQuantity={state.members.length}
        />
        <div className="font-inter grid md:grid-cols-[73fr_35fr] gap-[30px]">
          <div>
            <div className="bg-portfolioColor dark:bg-zinc-800 p-5 sm:p-[30px] dark:text-white rounded-[24px]">
              <div className="flex items-center justify-between mb-5">
                <span className="font-semibold leading-5">
                  Approval threshold
                </span>
                {state.members.length > 1 && (
                  <PencilIcon
                    className="!text-black dark:!text-white"
                    onClick={() => setModaltype(PolicyUpdateType.THRESHOLD)}
                  />
                )}
              </div>
              <div className="text-sm tracking-[0.5px] leading-[20px]">
                <b className="text-[42px] leading-[54px]">
                  {state.quorum.quorum}
                </b>{" "}
                of <b>{state.members.length}</b> approvals are required to
                initiate transactions and changes to NFID Vault settings.
              </div>
              {state.members.length > 1 && (
                <RangeSlider
                  value={state.quorum.quorum}
                  min={1}
                  max={state.members.length}
                  step={1}
                  disabled
                  showMarks
                  segmentGap={2}
                  highlightedSegments={[state.members.length - 1]}
                  className="!px-0"
                />
              )}
            </div>
            <div className="mt-5 sm:mt-10 ml-auto flex flex-col gap-2.5 dark:text-white relative w-[87%] sm:w-[84%]">
              <div className="absolute w-[1px] bg-gray-200 left-[-20px] sm:left-[-55px] -top-5 sm:-top-10 bottom-6"></div>
              {state.members.map((member) => (
                <div
                  key={member.userId}
                  className={clsx(
                    "bg-portfolioColor dark:bg-zinc-800 rounded-[24px] flex items-center px-2.5 py-[11px] transition duration-200",
                    "group has-[.pencil-trigger:hover]:bg-portfolioHoverColor has-[.pencil-trigger:hover]:dark:bg-darkGrayHover relative",
                  )}
                >
                  <div className="absolute right-[100%] top-0 h-1/2 w-[20px] sm:w-[55px] border-l border-b border-gray-200 rounded-bl-[8px]"></div>
                  <div className="ml-2 text-black dark:text-white">
                    <IconWallet />
                  </div>
                  <div className="ml-3 w-[60%]">
                    <p className="leading-6 text-sm mb-0.5">{member.name}</p>
                    <p className="leading-4 text-xs text-secondary tracking-[0.16px]">
                      Added: {memberCreatedToDate(member.createdDate)}
                    </p>
                  </div>
                  <div className="ml-2.5">
                    <CopyAddress
                      className="text-sm dark:text-white"
                      address={member.account?.owner.toText() || ""}
                      leadingChars={6}
                      trailingChars={4}
                      iconClassName="absolute right-[100%] mr-[3px]"
                    />
                  </div>
                  <PencilIcon
                    className={clsx(
                      "md:ml-auto md:mr-[15px] !text-black dark:!text-white md:opacity-0",
                      "absolute md:static top-[10px] right-[10px]",
                      "pencil-trigger group-hover:opacity-100 transition-opacity duration-200",
                    )}
                    onClick={() => {
                      setSelectedMember(member)
                      setModaltype(PolicyUpdateType.EDIT_APPROVER)
                    }}
                  />
                </div>
              ))}
              <Button
                type="ghost"
                className="w-[145px] !px-2.5 relative"
                isSmall
                icon={<PlusIcon className="w-[18px]" />}
                onClick={() => setModaltype(PolicyUpdateType.ADD_APPROVER)}
              >
                <div className="absolute right-[100%] top-0 h-1/2 w-[20px] sm:w-[55px] border-l border-b border-gray-200 rounded-bl-[8px] -translate-x-px"></div>
                Add approver
              </Button>
            </div>
          </div>
          <VaultPolicyInfo />
        </div>
      </>
    )
  },
)
