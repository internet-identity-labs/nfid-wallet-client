import React from "react"

import Empty from "./assets/empty.png"

interface IProfileApplicationsEmpty
  extends React.HTMLAttributes<HTMLDivElement> {}

const ProfileApplicationsEmpty: React.FC<IProfileApplicationsEmpty> = () => {
  return (
    <div className="flex flex-wrap justify-center mt-8 sm:mt-20">
      <img className="w-80" src={Empty} alt="empty" />
      <p className="w-full text-sm text-center">
        All the applications you’ve created accounts with will be displayed
        here.
      </p>
    </div>
  )
}

export default ProfileApplicationsEmpty
