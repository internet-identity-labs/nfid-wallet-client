import { useMemo } from "react"

import { IconCmpArrow } from "@nfid-frontend/ui"

interface IConnectionDetails {
  onBack: () => void
}
export const ConnectionDetails = ({ onBack }: IConnectionDetails) => {
  const details = useMemo(() => {
    return [
      {
        title: "Message",
        value: "This is a test statement",
      },
      {
        title: "URI",
        value: "https://localhost/login",
      },
      {
        title: "Version",
        value: "1",
      },
      {
        title: "Chain ID",
        value: "1",
      },
      {
        title: "Nonce",
        value: "oNCEHm5jzQU2WvuBB",
      },
    ]
  }, [])
  return (
    <div>
      <div className="flex items-center">
        <IconCmpArrow className="cursor-pointer" onClick={onBack} />
        <p className="text-xl font-bold ml-2.5">Connection details</p>
      </div>
      {details.map((item) => {
        return (
          <div className="mt-2 text-gray-400">
            <p className="mb-1 text-xs">{item.title}</p>
            <div className="h-10 text-sm bg-gray-100 pl-2.5 rounded-md flex items-center">
              {item.value}
            </div>
          </div>
        )
      })}
    </div>
  )
}
