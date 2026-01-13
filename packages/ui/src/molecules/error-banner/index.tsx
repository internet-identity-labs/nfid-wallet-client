import { Button, IconCmpError } from "@nfid/ui"

interface ErrorBannerProps {
  errorMessage?: string
  onRetry: () => void
}
export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  errorMessage,
  onRetry,
}) => {
  return (
    <div className="flex flex-col space-y-4">
      <div className={"rounded bg-red-200 p-8 text-sm"}>
        <div className="flex center">
          <div className="mr-2">
            <IconCmpError />
          </div>
          <div className="text-sm opacity-40">{errorMessage}</div>
        </div>
      </div>
      <Button type="primary" onClick={onRetry}>
        Retry
      </Button>
    </div>
  )
}
