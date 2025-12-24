export const idlFactory = ({ IDL }: { IDL: any }) => {
  const Conf = IDL.Record({
    max_user_addresses: IDL.Nat32,
    max_name_length: IDL.Nat32,
  })
  const AddressType = IDL.Variant({
    IcpAddress: IDL.Null,
    IcpPrincipal: IDL.Null,
    BTC: IDL.Null,
    ETH: IDL.Null,
  })
  const Address = IDL.Record({
    address_type: AddressType,
    value: IDL.Text,
  })
  const UserAddress = IDL.Record({
    id: IDL.Text,
    name: IDL.Text,
    addresses: IDL.Vec(Address),
  })
  const AddressBookError = IDL.Variant({
    NameTooLong: IDL.Null,
    MaxAddressesReached: IDL.Null,
    AddressNotFound: IDL.Null,
    DuplicateAddress: IDL.Null,
    DuplicateName: IDL.Null,
    Unauthorized: IDL.Null,
  })
  const Result = IDL.Variant({
    Ok: IDL.Null,
    Err: AddressBookError,
  })
  const ResultWithAddresses = IDL.Variant({
    Ok: IDL.Vec(UserAddress),
    Err: AddressBookError,
  })
  const SetConfigResult = IDL.Variant({
    Ok: IDL.Null,
    Err: AddressBookError,
  })
  return IDL.Service({
    save: IDL.Func([UserAddress], [ResultWithAddresses], []),
    delete: IDL.Func([IDL.Text], [ResultWithAddresses], []),
    delete_all: IDL.Func([], [Result], []),
    find_all: IDL.Func([], [ResultWithAddresses], ["query"]),
    get_config: IDL.Func([], [Conf], ["query"]),
    set_config: IDL.Func([Conf], [SetConfigResult], []),
  })
}
