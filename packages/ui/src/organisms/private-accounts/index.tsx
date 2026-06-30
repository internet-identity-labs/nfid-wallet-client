import ProfileContainer from "packages/ui/src/atoms/profile-container/Container"
import { FC, useState } from "react"

import { Button, ImageWithFallback } from "@nfid-frontend/ui"

import { useDarkTheme } from "frontend/hooks"
import { DiscoveryAppData } from "@nfid/integration/token/icrc1/types"
import clsx from "clsx"
import { DiscoveryUsersIcon } from "../../atoms/icons/discovery-users"
import { A } from "../../atoms/custom-link"
import useWindowSize from "../../utils/use-window-size"
import { DiscoverySkeleton } from "../../atoms/skeleton/discovery-skeleton"
import DiscoveryPlaceholder from "../discovery/assets/discovery-placeholder.jpg"
import { useNavigate } from "react-router-dom"

interface PrivateAccountsProps {
  privateAccounts?: DiscoveryAppData[]
  isLoading: boolean
  links: {
    privateAccounts: string
  }
}

export const PrivateAccounts: FC<PrivateAccountsProps> = ({
  privateAccounts,
  isLoading,
  links,
}) => {
  const isDarkTheme = useDarkTheme()
  const { width } = useWindowSize()
  const PAGE_SIZE = width < 1024 ? 4 : 6
  const [appsToShow, setAppsToShow] = useState<number>(PAGE_SIZE)
  const navigate = useNavigate()

  return (
    <>
      <ProfileContainer
        className="my-[20px] sm:my-[30px] sm:p-[20px] sm:p-[30px] dark:text-white"
        innerClassName="!px-0"
        titleClassName="!px-0"
      >
        {isLoading ? (
          <DiscoverySkeleton amount={PAGE_SIZE} />
        ) : (
          <>
            <div
              className={clsx(
                "grid gap-5",
                "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
              )}
            >
              {privateAccounts?.map((app) => (
                <div
                  key={app.id}
                  className={clsx(
                    "block rounded-[12px] overflow-hidden cursor-pointer",
                    "bg-gray-50 hover:bg-white dark:bg-zinc-800 dark:hover:bg-zinc-700",
                    "group hover:shadow-[0px_2px_15px_rgba(0,0,0,0.1)] dark:hover:bg-zinc-700 transition-all",
                  )}
                  onClick={() => {
                    navigate({
                      pathname: `${links.privateAccounts}/${app.id}`,
                    })
                  }}
                >
                  <div className="rounded-[12px] overflow-hidden relative">
                    <ImageWithFallback
                      alt={app.name}
                      src={`${app.image || "#"}`}
                      fallbackSrc={DiscoveryPlaceholder}
                      className="w-full h-full object-cover aspect-[335/175]"
                    />
                    {app.desc && (
                      <div
                        className={clsx(
                          "absolute top-0 left-0 right-0 m-auto z-2 flex items-center justify-center w-full h-full p-5 text-center",
                          "bg-white/60 dark:bg-zinc-500/60",
                          "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                          "text-sm leading-5 overflow-hidden rounded-[12px]",
                        )}
                        style={{
                          backdropFilter: "blur(10px)",
                          WebkitBackdropFilter: "blur(10px)",
                        }}
                      >
                        {app.desc}
                      </div>
                    )}
                  </div>
                  <div className="px-2.5 pt-3 pb-[15px]">
                    <div className="flex justify-between items-center mb-1 gap-2.5">
                      <span className="text-sm font-bold leading-5 dark:text-white">
                        {app.name}
                      </span>
                      <div className="flex items-center gap-[6px]">
                        <DiscoveryUsersIcon
                          strokeColor={isDarkTheme ? "white" : "black"}
                        />
                        <span>{Number(app.uniqueUsers)}</span>
                      </div>
                    </div>
                    <A target="_blank" href={app.url}>
                      {app.url}
                    </A>
                  </div>
                </div>
              ))}
            </div>
            <Button
              disabled={isLoading}
              className={clsx(
                "block mx-auto mt-[20px]",
                (!privateAccounts ||
                  privateAccounts.length <= appsToShow ||
                  !privateAccounts.length ||
                  isLoading) &&
                  "hidden",
              )}
              onClick={() => setAppsToShow((prev: number) => prev + PAGE_SIZE)}
              type="ghost"
            >
              {isLoading ? "Loading..." : "Load more"}
            </Button>
          </>
        )}
      </ProfileContainer>
    </>
  )
}
