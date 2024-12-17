import { mutate as mutateLib } from "swr"

export const mutate = (...params: Parameters<typeof mutateLib>) => {
  return mutateLib(
    params[0],
    { data: params[1], timestamp: Date.now() },
    params[2],
  )
}
