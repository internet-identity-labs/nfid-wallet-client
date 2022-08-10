import {
  JSON_SERIALISABLE_SIGNED_DELEGATION,
  NFID_SIGNED_DELEGATION,
} from "../internet-identity/__mocks"

export const REMOTE_LOGIN_REGISTER_MESSAGE = {
  type: "remote-login-register",
  anchor: 10064,
  reconstructableIdentity: NFID_SIGNED_DELEGATION,
  ...JSON_SERIALISABLE_SIGNED_DELEGATION,
}
