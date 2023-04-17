import { IconCmpArrow } from "@nfid-frontend/ui"

export interface IConnectionDetail {
  label: string
  value?: string
}

interface IConnectionDetails {
  onBack: () => void
  details: IConnectionDetail[]
}
export const ConnectionDetails = ({ onBack, details }: IConnectionDetails) => {
  return (
    <div>
      <div className="flex items-center">
        <IconCmpArrow className="cursor-pointer" onClick={onBack} />
        <p className="text-xl font-bold ml-2.5">Connection details</p>
      </div>
      <div className="mt-5 space-y-3 text-gray-400">
        {details.map((item) => {
          return (
            <div key={`detail_${item.label}_${item.value}`}>
              <p className="mb-1 text-xs">{item.label}</p>
              <div className="h-10 text-sm bg-gray-100 pl-2.5 rounded-md leading-10">
                {item.value}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
