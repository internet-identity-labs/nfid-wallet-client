import { mutate as mutateLib } from "swr"

export const mutateWithTimestamp = (
  ...params: Parameters<typeof mutateLib>
) => {
  return mutateLib(
    params[0],
    { data: params[1], timestamp: Date.now() },
    params[2],
  )
}

export const mutate = mutateLib
