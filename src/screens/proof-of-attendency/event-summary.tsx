import React from "react"

import { CalendarIcon } from "frontend/design-system/atoms/icons/calendar"
import { MapPinIcon } from "frontend/design-system/atoms/icons/map-pin"

interface EventSummaryProps {}

export const EventSummary: React.FC<EventSummaryProps> = ({ children }) => {
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
        <div className="swiper-title">
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
