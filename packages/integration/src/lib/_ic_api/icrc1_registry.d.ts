import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface _SERVICE {
  'add_icrc1_canister' : ActorMethod<[string], undefined>,
  'get_canisters' : ActorMethod<[], Array<string>>,
}
