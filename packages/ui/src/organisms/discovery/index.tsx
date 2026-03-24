import ProfileContainer from "packages/ui/src/atoms/profile-container/Container"
import { FC, useMemo, useState } from "react"

import {
  Button,
  IconNftPlaceholder,
  ImageWithFallback,
  Input,
} from "@nfid-frontend/ui"

import { useDarkTheme } from "frontend/hooks"
import { DiscoveryAppData } from "@nfid/integration/token/icrc1/types"
import { IoIosSearch } from "react-icons/io"
import { DiscoveryNameSortingIcon } from "../../atoms/icons/discovery-name-sorting"
import { DiscoveryUsersSortingIcon } from "../../atoms/icons/discovery-users-sorting"
import clsx from "clsx"
import { DiscoveryUsersIcon } from "../../atoms/icons/discovery-users"
import { A } from "../../atoms/custom-link"
import useWindowSize from "../../utils/use-window-size"
import { DiscoverySkeleton } from "../../atoms/skeleton/discovery-skeleton"

enum DiscoverySorting {
  NAME = "NAME",
  USERS = "USERS",
  DEFAULT = "DEFAULT",
}

interface DiscoveryProps {
  discoveryApps: DiscoveryAppData[]
  isLoading: boolean
}

export const Discovery: FC<DiscoveryProps> = ({ discoveryApps, isLoading }) => {
  const isDarkTheme = useDarkTheme()
  const { width } = useWindowSize()
  const PAGE_SIZE = width < 1024 ? 4 : 6
  const [search, setSearch] = useState("")
  const [sorting, setSorting] = useState<DiscoverySorting>(
    DiscoverySorting.DEFAULT,
  )
  const [appsToShow, setAppsToShow] = useState<number>(PAGE_SIZE)

  const getSortingIconColor = (active: boolean) => {
    if (active) return isDarkTheme ? "white" : "black"
    return isDarkTheme ? "#71717A" : "#9CA3AF"
  }

  const filteredApps = useMemo(() => {
    if (!discoveryApps) return []

    const query = search.toLowerCase()
    const filtered = search
      ? discoveryApps.filter((app) => app.name?.toLowerCase().includes(query))
      : [...discoveryApps]

    if (sorting === DiscoverySorting.NAME) {
      filtered.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""))
    } else if (sorting === DiscoverySorting.USERS) {
      filtered.sort((a, b) => Number(b.uniqueUsers) - Number(a.uniqueUsers))
    }

    return filtered.slice(0, appsToShow)
  }, [search, discoveryApps, sorting, appsToShow])

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
            <div className="flex flex-wrap items-center justify-between gap-5 mb-5 md:flex-nowrap">
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
                icon={
                  <IoIosSearch
                    size="20"
                    className="text-black dark:text-zinc-500"
                  />
                }
                placeholder="Search"
                inputClassName="bg-white !border-black dark:!border-zinc-500"
                className="w-full"
              />
              <div className="flex items-center w-full gap-5 md:w-auto">
                <span className="text-sm leading-5 whitespace-nowrap text-secondary dark:text-zinc-500">
                  Sort by
                </span>
                <div
                  className="text-sm leading-5 whitespace-nowrap flex items-center gap-[6px] cursor-pointer"
                  style={{
                    color: getSortingIconColor(
                      sorting === DiscoverySorting.NAME,
                    ),
                  }}
                  onClick={() =>
                    setSorting((prev) =>
                      prev === DiscoverySorting.NAME
                        ? DiscoverySorting.DEFAULT
                        : DiscoverySorting.NAME,
                    )
                  }
                >
                  <div className="w-[18px]">
                    <DiscoveryNameSortingIcon
                      strokeColor={getSortingIconColor(
                        sorting === DiscoverySorting.NAME,
                      )}
                    />
                  </div>
                  <span>Name</span>
                </div>
                <div
                  className="text-sm leading-5 whitespace-nowrap flex items-center gap-[6px] cursor-pointer"
                  style={{
                    color: getSortingIconColor(
                      sorting === DiscoverySorting.USERS,
                    ),
                  }}
                  onClick={() =>
                    setSorting((prev) =>
                      prev === DiscoverySorting.USERS
                        ? DiscoverySorting.DEFAULT
                        : DiscoverySorting.USERS,
                    )
                  }
                >
                  <div className="w-[18px]">
                    <DiscoveryUsersSortingIcon
                      strokeColor={getSortingIconColor(
                        sorting === DiscoverySorting.USERS,
                      )}
                    />
                  </div>
                  <span>Unique users</span>
                </div>
              </div>
            </div>
            <div
              className={clsx(
                "grid gap-5",
                "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
              )}
            >
              {filteredApps.map((app) => (
                <div
                  key={app.id}
                  className={clsx(
                    "rounded-[12px] overflow-hidden cursor-pointer",
                    "bg-gray-50 hover:bg-white dark:bg-zinc-800 dark:hover:bg-zinc-700",
                    "group hover:shadow-[0px_2px_15px_rgba(0,0,0,0.1)] dark:hover:bg-zinc-700 transition-all",
                  )}
                >
                  <div className="rounded-[12px] overflow-hidden relative h-[175px]">
                    <ImageWithFallback
                      alt={app.name}
                      src={`${app.image || "#"}`}
                      fallbackSrc={IconNftPlaceholder}
                      className={clsx(
                        "w-full h-full",
                        app.image ? "object-cover" : "object-contain",
                      )}
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
                    <A href={app.url} target="_blank">
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
                (discoveryApps.length <= appsToShow ||
                  !discoveryApps.length ||
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
