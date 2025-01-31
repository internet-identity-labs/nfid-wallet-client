import {actor} from "@nfid/integration";
import {_SERVICE} from "./idl/service.d";
import {idlFactory} from "./idl/service";

//TODO WIP stage/prod
const canisterId = "zhr63-daaaa-aaaap-qbh4q-cai"

export async function getSalt() {
  return await ecdsaStorageActor.get_salt()
}

export async function getAnonSalt(domain: string) {
  return await ecdsaStorageActor.get_anon_salt(domain)
}

function getActor() {
  return actor<_SERVICE>(canisterId, idlFactory)
}

const ecdsaStorageActor = getActor()
