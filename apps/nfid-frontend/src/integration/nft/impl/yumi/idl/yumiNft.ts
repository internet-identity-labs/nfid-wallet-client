export const idlFactory = ({ IDL }: any) => {
  const User = IDL.Variant({
    principal: IDL.Principal,
    address: IDL.Text,
  })
  const AllowanceRequest = IDL.Record({
    token: IDL.Text,
    owner: User,
    spender: IDL.Principal,
  })
  const CommonError = IDL.Variant({
    InvalidToken: IDL.Text,
    Other: IDL.Text,
  })
  const Result = IDL.Variant({ Ok: IDL.Nat32, Err: CommonError })
  const ApproveRequest = IDL.Record({
    token: IDL.Text,
    subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
    allowance: IDL.Nat32,
    spender: IDL.Principal,
  })
  const BalanceRequest = IDL.Record({ token: IDL.Text, user: User })
  const MintRequest = IDL.Record({
    to: User,
    metadata: IDL.Opt(IDL.Vec(IDL.Nat8)),
  })
  const Result_1 = IDL.Variant({ Ok: IDL.Text, Err: CommonError })
  const ClaimRequest = IDL.Record({ to: User, index: IDL.Nat32 })
  const Metadata = IDL.Variant({
    fungible: IDL.Record({
      decimals: IDL.Nat8,
      metadata: IDL.Opt(IDL.Vec(IDL.Nat8)),
      name: IDL.Text,
      symbol: IDL.Text,
    }),
    nonfungible: IDL.Record({ metadata: IDL.Opt(IDL.Vec(IDL.Nat8)) }),
  })
  const Result_2 = IDL.Variant({ Ok: Metadata, Err: CommonError })
  const Info = IDL.Record({
    reserve: IDL.Nat32,
    claimed: IDL.Nat32,
    available: IDL.Nat32,
    supply: IDL.Nat32,
  })
  const Result_3 = IDL.Variant({
    Ok: IDL.Vec(IDL.Nat32),
    Err: CommonError,
  })
  const TransferRequest = IDL.Record({
    to: User,
    token: IDL.Text,
    from: User,
    memo: IDL.Vec(IDL.Nat8),
    subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
    amount: IDL.Nat32,
  })
  const TransferError = IDL.Variant({
    CannotNotify: IDL.Text,
    InsufficientBalance: IDL.Nat32,
    InvalidToken: IDL.Text,
    Rejected: IDL.Null,
    Unauthorized: IDL.Text,
    Other: IDL.Text,
  })
  const Result_4 = IDL.Variant({ Ok: IDL.Nat32, Err: TransferError })
  return IDL.Service({
    account_id: IDL.Func([IDL.Principal], [IDL.Text], ["query"]),
    add_manager: IDL.Func([IDL.Principal], [IDL.Nat64], []),
    allowance: IDL.Func([AllowanceRequest], [Result], ["query"]),
    approve: IDL.Func([ApproveRequest], [IDL.Bool], []),
    approveAll: IDL.Func([IDL.Vec(ApproveRequest)], [IDL.Vec(IDL.Nat32)], []),
    balance: IDL.Func([BalanceRequest], [Result], ["query"]),
    batchMintNFT: IDL.Func([IDL.Vec(MintRequest)], [IDL.Vec(IDL.Nat32)], []),
    bearer: IDL.Func([IDL.Text], [Result_1], ["query"]),
    claimNFT: IDL.Func([MintRequest], [IDL.Nat32], []),
    claim_count: IDL.Func([], [Result], ["query"]),
    claim_supply: IDL.Func([], [Result], ["query"]),
    extensions: IDL.Func([], [IDL.Vec(IDL.Text)], ["query"]),
    force_claim_reserve: IDL.Func([ClaimRequest], [IDL.Nat32], []),
    getAllowances: IDL.Func(
      [],
      [IDL.Vec(IDL.Tuple(IDL.Nat32, IDL.Principal))],
      ["query"],
    ),
    getMinter: IDL.Func([], [IDL.Principal], ["query"]),
    getRegistry: IDL.Func(
      [],
      [IDL.Vec(IDL.Tuple(IDL.Nat32, IDL.Text))],
      ["query"],
    ),
    getTokens: IDL.Func(
      [],
      [IDL.Vec(IDL.Tuple(IDL.Nat32, Metadata))],
      ["query"],
    ),
    getTokensByIds: IDL.Func(
      [IDL.Vec(IDL.Nat32)],
      [IDL.Vec(IDL.Tuple(IDL.Nat32, Metadata))],
      ["query"],
    ),
    init_reserve: IDL.Func([IDL.Nat32], [], []),
    is_manager: IDL.Func([IDL.Principal], [IDL.Bool], ["query"]),
    metadata: IDL.Func([IDL.Text], [Result_2], ["query"]),
    mintNFT: IDL.Func([MintRequest], [IDL.Nat32], []),
    pop_info: IDL.Func([], [Info], ["query"]),
    reserve_tokens: IDL.Func([], [IDL.Vec(IDL.Nat32)], ["query"]),
    setMinter: IDL.Func([IDL.Principal], [], []),
    set_claim_supply: IDL.Func([IDL.Nat32], [], []),
    supply: IDL.Func([IDL.Text], [Result], ["query"]),
    test: IDL.Func([], [User], ["query"]),
    token_id: IDL.Func([IDL.Nat32], [IDL.Text], ["query"]),
    tokens: IDL.Func([IDL.Text], [Result_3], ["query"]),
    transfer: IDL.Func([TransferRequest], [Result_4], []),
  })
}
