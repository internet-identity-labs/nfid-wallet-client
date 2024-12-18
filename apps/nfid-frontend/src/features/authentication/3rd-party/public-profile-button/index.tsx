import clsx from "clsx"

import { Loader, RadioButton } from "@nfid-frontend/ui"
import { truncateString } from "@nfid-frontend/utils"
import { authState } from "@nfid/integration"
import { useSWR } from "@nfid/swr"

import { ProfileTypes } from "../choose-account"
import { getPublicProfile } from "../choose-account/services"

export interface IPublicProfileButton {
  isAvailable: boolean
  selectedProfile: ProfileTypes
  setSelectedProfile: (value: ProfileTypes) => void
  onError: () => void
}
export const PublicProfileButton = ({
  isAvailable,
  setSelectedProfile,
  selectedProfile,
  onError,
}: IPublicProfileButton) => {
  const {
    data: publicProfile,
    isValidating,
    isLoading,
  } = useSWR(authState ? "publicProfile" : null, getPublicProfile, {
    revalidateOnFocus: false,
    onError,
  })

  if (!publicProfile || isValidating || isLoading)
    return (
      <div className="absolute top-0 left-0 flex items-center justify-center w-full h-full bg-white rounded-xl">
        <Loader imageClasses="w-16" isLoading={true} fullscreen={false} />
      </div>
    )

  return (
    <div
      className={clsx(
        "flex justify-between text-xs lowercase h-5 mt-5",
        !isAvailable && "!text-gray-400 !pointer-events-none",
      )}
    >
      <div className="flex items-center">
        <RadioButton
          id="profile_public"
          onChange={(e) => setSelectedProfile(e.target.value as ProfileTypes)}
          value="public"
          checked={selectedProfile === "public"}
          name={"profile"}
          disabled={!isAvailable}
        />
        <label
          htmlFor="profile_public"
          className="ml-2 lowercase cursor-pointer"
        >
          {truncateString(publicProfile.principal.toString(), 6, 4)}
        </label>
      </div>
      {publicProfile?.balance ? (
        <div className="uppercase">{publicProfile?.balance} ICP</div>
      ) : null}
    </div>
  )
}
