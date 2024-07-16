import { Fragment, FunctionFragment, Interface } from "ethers/lib/utils"

import { DecodedFunctionCall } from "./method-decoder/method-decoder"

class FunctionCallService {
  decode(data: string, fragment: Fragment): DecodedFunctionCall {
    const method = fragment.name

    try {
      const iface = new Interface([fragment as Fragment])
      const inputs = iface.decodeFunctionData(
        FunctionFragment.from(fragment as Fragment),
        data,
      )
      const names =
        fragment.inputs?.map((input) => {
          if (input.type.includes("tuple")) {
            return [input.name, input.components?.map((c) => c.name)]
          }
          return input.name
        }) ?? []
      const types =
        fragment.inputs?.map((input) => {
          if (input.type.includes("tuple")) {
            const componentTypes =
              input.components?.map((c) => c.type).join(",") ?? ""
            return `(${componentTypes})`
          }
          return input.type
        }) ?? []
      // FIXME:
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return { method, inputs, names, types }
    } catch (error) {
      console.debug(`${method} is not a match`)
    }

    return { method: "", inputs: [], names: [], types: [] }
  }
}

export const functionCallService = new FunctionCallService()
