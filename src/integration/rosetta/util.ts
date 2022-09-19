import { camelCase } from "lodash"

export async function restCall<T>(
  method: string,
  url: string,
  request?: T,
): Promise<Response> {
  let metadata = {
    method: method,
    headers: {
      "Content-Type": "application/json",
    },
  }

  if (request) {
    metadata = { ...metadata, ...{ body: JSON.stringify(request) } }
  }

  return await fetch(url, metadata)
    .then(async (response: Response) => {
      if (!response.ok) {
        throw Error(response.statusText)
      }
      console.log("---------------")
      console.log(response)
      return response
    })
    .catch((e: Error) => {
      throw e
    })
}

export function camelizeKeys(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map((v) => camelizeKeys(v))
  } else if (obj != null && obj.constructor === Object) {
    return Object.keys(obj).reduce(
      (result, key) => ({
        ...result,
        [camelCase(key)]: camelizeKeys(obj[key]),
      }),
      {},
    )
  }
  return obj
}
