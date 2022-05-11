import React from "react"
import { useSearchParams, useParams, generatePath } from "react-router-dom"

export const useGeneratePath = () => {
  const params = useParams()
  const [query] = useSearchParams()

  const handleGeneratePath = React.useCallback(
    (path: string) => `${generatePath(path, params)}?${query.toString()}`,
    [params, query],
  )
  return {
    generatePath: handleGeneratePath,
  }
}
