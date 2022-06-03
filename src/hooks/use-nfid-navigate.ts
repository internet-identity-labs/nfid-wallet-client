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

  const urlParams = React.useMemo(() => {
    return Object.keys(params).reduce(
      (acc, key) => ({
        ...acc,
        [key]: encodeURIComponent(params[key] as string),
      }),
      {},
    )
  }, [params])

  const generatePath = React.useCallback(
    (path: string) => `${rrGeneratePath(path, urlParams)}?${query.toString()}`,
    [urlParams, query],
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
