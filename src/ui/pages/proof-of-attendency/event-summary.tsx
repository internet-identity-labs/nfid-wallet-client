import React from "react"

import { CalendarIcon } from "frontend/ui/atoms/icons/calendar"
import { MapPinIcon } from "frontend/ui/atoms/icons/map-pin"

export const EventSummary = () => {
  return (
    <div>
      <div className="flex flex-col">
        <div className="flex text-sm">
          <div>
            <CalendarIcon />
          </div>
          <div className="mb-2 ml-2">April 22-28, 2022</div>
        </div>
        <div className="flex text-sm">
          <div>
            <MapPinIcon />
          </div>
          <div className="mb-2 ml-2">
            Computer History Museum, Mountain View, CA
          </div>
        </div>
      </div>

      <div className="max-w-2xl">
        <div className="mb-5 font-bold sm:text-title text-titleMobile">
          <span
            className="clip-text whitespace-nowrap"
            style={{
              background: `linear-gradient(90deg,#B649FF,#FF9029)`,
            }}
          >
            Internet Identity
          </span>
          <br />
          Workshop
        </div>
      </div>
    </div>
  )
}
