import { useAuthenticationContext } from "apps/nfid-demo/src/context/authentication"
import clsx from "clsx"

import { Button, CenterEllipsis, Copy, IconCmpInfo, Popover } from "@nfid/ui"

const UserNavigation = () => {
  const context = useAuthenticationContext()

  return (
    <div className="flex justify-end flex-1">
      <Popover
        align="end"
        trigger={
          <Button
            id="myDelegation"
            disabled={!context.identity}
            type="primary"
            icon={<IconCmpInfo />}
            isSmall
          >
            My Delegation
          </Button>
        }
      >
        <div
          className={clsx(
            "bg-white rounded-lg border p-4",
            "w-96 shadow-md mt-1 mr-4 space-y-1",
          )}
        >
          <div>
            <p className="mb-1 text-sm text-gray-400">Principal ID</p>
            <div className="rounded-md bg-gray-100 text-gray-400 flex items-center justify-between px-2.5 h-10 text-sm">
              <CenterEllipsis
                value={context.config?.principalID ?? ""}
                leadingChars={29}
                trailingChars={5}
                id={"principal"}
              />
              <Copy value={context.config?.principalID ?? ""} />
            </div>
          </div>
          <div>
            <p className="mb-1 text-sm text-gray-400">Address</p>
            <div className="rounded-md bg-gray-100 text-gray-400 flex items-center justify-between px-2.5 h-10 text-sm">
              <CenterEllipsis
                value={context.config?.address ?? ""}
                leadingChars={29}
                trailingChars={5}
                id={"address"}
              />
              <Copy value={context.config?.address ?? ""} />
            </div>
          </div>
          <div>
            <p className="mb-1 text-sm text-gray-400">Expiration time</p>
            <div className="rounded-md bg-gray-100 text-gray-400 flex items-center justify-between px-2.5 h-10 text-sm">
              {context.config?.expirationTime}
            </div>
          </div>
          <div>
            <p className="mb-1 text-sm text-gray-400">Targets</p>
            <div className="rounded-md bg-gray-100 text-gray-400 flex items-center justify-between px-2.5 h-10 text-sm">
              <ul id="myTargetsList" className="py-2">
                {context.config?.targets?.map((target) => (
                  <li key={"target_" + target.toString()}>
                    - {target.toString()}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Popover>
    </div>
  )
}

export default UserNavigation
