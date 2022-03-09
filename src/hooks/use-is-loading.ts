import React from "react"

export const useIsLoading = () => {
  const [isLoading, setIsloading] = React.useState(false)
  return { isLoading, setIsloading }
}
