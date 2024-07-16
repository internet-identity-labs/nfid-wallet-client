import { Decoder } from "./decoder"

class DependencyService {
  group<A, I, O, T extends Decoder<A, string, I, O>>(
    decoders: T[],
  ): {
    [key: string]: T
  } {
    return decoders
      .map((x) => {
        return { key: x.getMethod(), value: x }
      })
      .reduce((obj, item) => {
        obj[item.key] = item.value
        return obj
      }, {} as Record<string, T>)
  }
}

export const dependencyService = new DependencyService()
