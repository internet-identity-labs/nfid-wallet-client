import { NFID } from "@nfid/embed"

/** Key algorithm for `NFID.init` — `@nfid/embed` does not export this alias publicly. */
export type NfidEmbedKeyType = NonNullable<
  Parameters<typeof NFID.init>[0]["keyType"]
>
