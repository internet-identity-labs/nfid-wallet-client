/* eslint-disable @typescript-eslint/no-explicit-any */
import useSWRLib, { SWRHook, SWRResponse } from "swr"

// any to inherit types correctly
export const useSWRWithTimestamp: SWRHook = (
  key: any,
  fetcher?: any,
  options?: any,
) => {
  const { data, ...swr } = useSWRLib(key, fetcher, options)
  return {
    data: data?.data || data,
    ...swr,
  } as SWRResponse
}

export const useSWR = useSWRLib
