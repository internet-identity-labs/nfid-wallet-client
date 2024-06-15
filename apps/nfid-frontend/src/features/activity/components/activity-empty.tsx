import { ArrowsHistoryIcon } from "frontend/ui/atoms/icons/arrows-history"

export interface IActivityPage {}

const ActivityEmpty = () => {
  return (
    <div className="min-h-[270px] flex flex-col justify-center items-center">
      <ArrowsHistoryIcon />
      <p className="text-gray-400 text-sm mt-[20px]">
        No recent activities to display.
      </p>
    </div>
  )
}

export default ActivityEmpty
