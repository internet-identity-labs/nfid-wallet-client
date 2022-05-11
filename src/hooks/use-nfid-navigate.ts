import React from "react"
import {
  useSearchParams,
  useParams,
  generatePath as rrGeneratePath,
  useNavigate,
  NavigateOptions,
} from "react-router-dom"

export const useNFIDNavigate = () => {
  const params = useParams()
  const [query] = useSearchParams()
  const rrNavigate = useNavigate()

  const generatePath = React.useCallback(
    (path: string) => `${rrGeneratePath(path, params)}?${query.toString()}`,
    [params, query],
  )

  const navigate = React.useCallback(
    (path: string, options?: NavigateOptions) => {
      rrNavigate(generatePath(path), options)
    },
    [generatePath, rrNavigate],
  )
  const navigateFactory = React.useCallback(
    (path: string, options?: NavigateOptions) => () => navigate(path, options),
    [navigate],
  )

  return {
    generatePath,
    navigate,
    navigateFactory,
  }
}
