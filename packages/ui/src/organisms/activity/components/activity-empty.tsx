import { ArrowsHistoryIcon } from "@nfid-frontend/ui"

export interface IActivityPage {}

export const ActivityEmpty = () => {
  return (
    <div className="min-h-[270px] flex flex-col justify-center items-center">
      <ArrowsHistoryIcon />
      <p className="text-gray-400 dark:text-zinc-500 text-sm mt-[20px]">
        No recent activities to display.
      </p>
    </div>
  )
}
