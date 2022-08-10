import { Certificate } from "."

export function factoryCertificate(): Certificate {
  return {
    domain: "test.com",
    clientPrincipal: "aaaaa-aa",
    phoneNumberSha2: "asdf",
    createdDate: new Date(),
  }
}
