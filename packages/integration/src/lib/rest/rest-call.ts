export async function restCall<T>(
  method: string,
  url: string,
  request?: T,
): Promise<Response> {
  let metadata = {
    method,
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
      return response
    })
    .catch((e: Error) => {
      throw e
    })
}
