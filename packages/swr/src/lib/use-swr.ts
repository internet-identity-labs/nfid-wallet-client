/* eslint-disable @typescript-eslint/no-explicit-any */
import useSWRLib, { SWRHook, SWRResponse } from "swr"

// any to inherit types correctly
export const useSWRWithTimestamp: SWRHook = (
  key: any,
  fetcher?: any,
  options?: any,
) => {
  const { data, ...swr } = useSWRLib(
    key,
    fetcher
      ? async (...args: unknown[]) => {
          const response = await fetcher(...args)
          return {
            data: response,
            timestamp: Date.now(),
          }
        }
      : fetcher,
    options
      ? {
          ...options,
          onSuccess:
            options.onSuccess && ((args) => options.onSuccess(args.data)),
        }
      : options,
  )
  return {
    data: data?.data,
    ...swr,
  } as SWRResponse
}

export const useSWR = useSWRLib
