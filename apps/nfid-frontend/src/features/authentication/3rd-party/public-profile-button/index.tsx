import clsx from "clsx"
import useSWR from "swr"

import { RadioButton } from "@nfid-frontend/ui"

import { ProfileTypes } from "../choose-account"
import { getPublicProfile } from "../choose-account/services"

export interface IPublicProfileButton {
  isAvailable: boolean
  setSelectedProfile: (value: ProfileTypes) => void
}
export const PublicProfileButton = ({
  isAvailable,
  setSelectedProfile,
}: IPublicProfileButton) => {
  const { data: publicProfile } = useSWR("publicProfile", getPublicProfile)

  return (
    <div
      className={clsx(
        "flex justify-between text-xs uppercase font-mono h-5 mt-5",
        !isAvailable && "!text-gray-400",
      )}
    >
      <div className="flex items-center">
        <RadioButton
          id="profile_public"
          onChange={(e) => setSelectedProfile(e.target.value as ProfileTypes)}
          value="public"
          name={"profile"}
          disabled={!isAvailable}
        />
        <label htmlFor="profile_public" className="ml-2">
          My NFID profile
        </label>
      </div>
      {publicProfile?.balance ? <div>{publicProfile?.balance} ICP</div> : null}
    </div>
  )
}
