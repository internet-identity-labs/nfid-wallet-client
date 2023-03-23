import { ReactComponent as Error } from "../../atoms/icons/error.svg"
import { Button } from "../../molecules/button"
import { Page } from "../page/page"

type ErrorCmpProps = {
  error?: Error
  onRetry: () => void
  onCancel: () => void
}

export const PageError: React.FC<ErrorCmpProps> = ({
  error,
  onRetry,
  onCancel,
}) => {
  return (
    <Page>
      <Page.Header>
        <div className="flex gap-2">
          <Error className="text-red-500" />
          <div className="font-bold">Error</div>
        </div>
      </Page.Header>
      <Page.Body>
        <div className="font-bold">An unexpected error has occurred.</div>
        <div className="overflow-scroll">
          {error?.message || "An unexpected error has occurred."}
        </div>
      </Page.Body>
      <Page.Footer>
        <div className="flex w-full gap-2">
          <Button
            type="stroke"
            onClick={onCancel}
            className="flex items-center justify-center flex-1"
          >
            Cancel
          </Button>
          <Button
            type="secondary"
            onClick={onRetry}
            className="flex items-center justify-center flex-1"
          >
            Try again
          </Button>
        </div>
      </Page.Footer>
    </Page>
  )
}
