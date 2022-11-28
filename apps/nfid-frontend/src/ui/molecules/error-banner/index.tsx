import { ErrorIcon } from "@nfid-frontend/ui/icons/error"

interface ErrorBannerProps {
  errorMessage?: string
}
export const ErrorBanner: React.FC<ErrorBannerProps> = ({ errorMessage }) => {
  return (
    <div className={"rounded bg-red-200 p-8 text-sm"}>
      <div className="flex center">
        <div className="mr-2">
          <ErrorIcon />
        </div>
        <div className="text-sm opacity-40">{errorMessage}</div>
      </div>
    </div>
  )
}
