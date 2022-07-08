import React from "react"

/**
 * @deprecated
 */
export const useIsLoading = (defaultState: boolean = false) => {
  const [isLoading, setIsloading] = React.useState(defaultState)
  return { isLoading, setIsloading }
}
