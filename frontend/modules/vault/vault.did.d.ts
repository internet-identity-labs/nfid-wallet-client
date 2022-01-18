import type { Principal } from "@dfinity/principal"
export interface KVEntry {
  key: Key
  value: Value
}
export type Key = string
export interface PrincipaledKVArray {
  principal: Principal
  kvstore: Array<KVEntry>
}
export type Value = string
export interface _SERVICE {
  clear: () => Promise<undefined>
  delete: (arg_0: Key) => Promise<undefined>
  get_kvstore: () => Promise<Array<KVEntry>>
  insert: (arg_0: Key, arg_1: Value) => Promise<undefined>
  leak: () => Promise<Array<PrincipaledKVArray>>
  lookup: (arg_0: Key) => Promise<[] | [Value]>
}
