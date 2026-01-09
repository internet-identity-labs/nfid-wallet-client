export const idlFactory = ({ IDL }: any) => {
  const AddressBookAddressType = IDL.Variant({
    IcpAddress: IDL.Null,
    IcpPrincipal: IDL.Null,
    BTC: IDL.Null,
    ETH: IDL.Null,
  })
  const AddressBookAddress = IDL.Record({
    address_type: AddressBookAddressType,
    value: IDL.Text,
  })
  const AddressBookUserAddress = IDL.Record({
    id: IDL.Text,
    name: IDL.Text,
    addresses: IDL.Vec(AddressBookAddress),
  })
  const AddressBookError = IDL.Variant({
    NameTooLong: IDL.Null,
    MaxAddressesReached: IDL.Null,
    AddressNotFound: IDL.Null,
    DuplicateAddress: IDL.Null,
    DuplicateName: IDL.Null,
    Unauthorized: IDL.Null,
  })
  const Result_1 = IDL.Variant({
    Ok: IDL.Vec(AddressBookUserAddress),
    Err: AddressBookError,
  })
  const Result = IDL.Variant({ Ok: IDL.Null, Err: AddressBookError })
  const AddressBookConf = IDL.Record({
    max_user_addresses: IDL.Nat32,
    max_name_length: IDL.Nat32,
  })
  const Conf = IDL.Record({ im_canister: IDL.Opt(IDL.Text) })
  const ICRC1State = IDL.Variant({
    Inactive: IDL.Null,
    Active: IDL.Null,
  })
  const ICRC1 = IDL.Record({
    state: ICRC1State,
    ledger: IDL.Text,
    network: IDL.Nat32,
  })
  return IDL.Service({
    address_book_delete: IDL.Func([IDL.Text], [Result_1], []),
    address_book_delete_all: IDL.Func([], [Result], []),
    address_book_find_all: IDL.Func([], [Result_1], ["query"]),
    address_book_get_config: IDL.Func([], [AddressBookConf], ["query"]),
    address_book_save: IDL.Func([AddressBookUserAddress], [Result_1], []),
    address_book_set_config: IDL.Func([AddressBookConf], [Result], []),
    get_canisters_by_root: IDL.Func([IDL.Text], [IDL.Vec(ICRC1)], ["query"]),
    remove_icrc1_canister: IDL.Func([IDL.Text], [], []),
    store_icrc1_canister: IDL.Func(
      [IDL.Text, ICRC1State, IDL.Opt(IDL.Nat32)],
      [],
      [],
    ),
  })
}
export const init = ({ IDL }: any) => {
  const Conf = IDL.Record({ im_canister: IDL.Opt(IDL.Text) })
  return [Conf]
}
