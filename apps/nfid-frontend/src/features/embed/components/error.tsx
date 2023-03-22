import { Button, Page } from "@nfid-frontend/ui"

type ErrorCmpProps = {
  error?: Error
  onRetry: () => void
  onCancel: () => void
}

export const ErrorCmp: React.FC<ErrorCmpProps> = ({
  error,
  onRetry,
  onCancel,
}) => {
  return (
    <Page>
      <Page.Header>Error</Page.Header>
      <Page.Body>
        <pre>{error?.message || "An unexpected error has occurred."}</pre>
      </Page.Body>
      <Page.Footer>
        <div className="flex gap-2">
          <Button
            type="stroke"
            onClick={onRetry}
            className="flex items-center justify-center"
          >
            Retry
          </Button>
          <Button
            onClick={onCancel}
            className="flex items-center justify-center"
          >
            Cancel
          </Button>
        </div>
      </Page.Footer>
    </Page>
  )
}
