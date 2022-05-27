import clsx from "clsx"
import React from "react"

import { PlusIcon } from "frontend/design-system/atoms/icons/plus"
import { H5 } from "frontend/design-system/atoms/typography"
import { List } from "frontend/design-system/molecules/list"

import { recoveryMethod } from "../"
import { RecoveryMethodListItem } from "./recovery-list-item"

interface RecoveryMethodsListProps {
  recoveryMethods: recoveryMethod[]
  onRecoveryUpdate: (recoveryMethod: recoveryMethod) => Promise<void>
  onRecoveryDelete: (recoveryMethod: recoveryMethod) => Promise<void>
}

export const RecoveryMethodsList: React.FC<RecoveryMethodsListProps> = ({
  recoveryMethods,
  onRecoveryUpdate,
  onRecoveryDelete,
}) => {
  return (
    <div className={clsx("px-5 md:px-16 pt-8", "bg-white flex-1 md:pt-16")}>
      <List>
        <List.Header>
          <div className="flex items-center justify-between mb-3">
            <H5>Account recovery methods</H5>

            <div className="">
              <PlusIcon className="w-6 h-6 text-gray-500" />
            </div>
          </div>
        </List.Header>
        <List.Items className="ml-0">
          {recoveryMethods.length > 0 &&
            recoveryMethods.map((method) => (
              <RecoveryMethodListItem
                key={`${method.label}-${method.lastUsed}`}
                recoveryMethod={method}
                onRecoveryUpdate={function (
                  recoveryMethod: recoveryMethod,
                ): Promise<void> {
                  throw new Error("Function not implemented.")
                }}
                onRecoveryDelete={function (
                  recoveryMethod: recoveryMethod,
                ): Promise<void> {
                  throw new Error("Function not implemented.")
                }}
              />
            ))}
          {!recoveryMethods.length && (
            <div className="text-sm">
              <p className="mb-6 font-bold">Don’t get locked out!</p>
              <p>
                Protect your account by adding an account recovery method in
                case your authorized devices are all lost.
              </p>
            </div>
          )}
        </List.Items>
      </List>
    </div>
  )
}
