export const idlFactory = ({ IDL }: any) => {
  const Tokens = IDL.Record({ e8s: IDL.Nat64 })
  const Allowance = IDL.Record({
    from_account_id: IDL.Text,
    to_spender_id: IDL.Text,
    allowance: Tokens,
    expires_at: IDL.Opt(IDL.Nat64),
  })
  const AccountIdentifier = IDL.Vec(IDL.Nat8)
  const AccountBalanceArgs = IDL.Record({ account: AccountIdentifier })
  const TextAccountIdentifier = IDL.Text
  const AccountBalanceArgsDfx = IDL.Record({
    account: TextAccountIdentifier,
  })
  const Archive = IDL.Record({ canister_id: IDL.Principal })
  const Archives = IDL.Record({ archives: IDL.Vec(Archive) })
  const SubAccount = IDL.Vec(IDL.Nat8)
  const Account = IDL.Record({
    owner: IDL.Principal,
    subaccount: IDL.Opt(SubAccount),
  })
  const Icrc1Tokens = IDL.Nat
  const Value = IDL.Variant({
    Int: IDL.Int,
    Nat: IDL.Nat,
    Blob: IDL.Vec(IDL.Nat8),
    Text: IDL.Text,
  })
  const Icrc1Timestamp = IDL.Nat64
  const TransferArg = IDL.Record({
    to: Account,
    fee: IDL.Opt(Icrc1Tokens),
    memo: IDL.Opt(IDL.Vec(IDL.Nat8)),
    from_subaccount: IDL.Opt(SubAccount),
    created_at_time: IDL.Opt(Icrc1Timestamp),
    amount: Icrc1Tokens,
  })
  const Icrc1BlockIndex = IDL.Nat
  const Icrc1TransferError = IDL.Variant({
    GenericError: IDL.Record({
      message: IDL.Text,
      error_code: IDL.Nat,
    }),
    TemporarilyUnavailable: IDL.Null,
    BadBurn: IDL.Record({ min_burn_amount: Icrc1Tokens }),
    Duplicate: IDL.Record({ duplicate_of: Icrc1BlockIndex }),
    BadFee: IDL.Record({ expected_fee: Icrc1Tokens }),
    CreatedInFuture: IDL.Record({ ledger_time: IDL.Nat64 }),
    TooOld: IDL.Null,
    InsufficientFunds: IDL.Record({ balance: Icrc1Tokens }),
  })
  const Icrc1TransferResult = IDL.Variant({
    Ok: Icrc1BlockIndex,
    Err: Icrc1TransferError,
  })
  const AllowanceArgs = IDL.Record({
    account: Account,
    spender: Account,
  })
  const TimeStamp = IDL.Record({ timestamp_nanos: IDL.Nat64 })
  const Allowance_1 = IDL.Record({
    allowance: Icrc1Tokens,
    expires_at: IDL.Opt(TimeStamp),
  })
  const ApproveArgs = IDL.Record({
    fee: IDL.Opt(Icrc1Tokens),
    memo: IDL.Opt(IDL.Vec(IDL.Nat8)),
    from_subaccount: IDL.Opt(SubAccount),
    created_at_time: IDL.Opt(TimeStamp),
    amount: Icrc1Tokens,
    expected_allowance: IDL.Opt(Icrc1Tokens),
    expires_at: IDL.Opt(TimeStamp),
    spender: Account,
  })
  const ApproveError = IDL.Variant({
    GenericError: IDL.Record({
      message: IDL.Text,
      error_code: IDL.Nat,
    }),
    TemporarilyUnavailable: IDL.Null,
    Duplicate: IDL.Record({ duplicate_of: Icrc1BlockIndex }),
    BadFee: IDL.Record({ expected_fee: Icrc1Tokens }),
    AllowanceChanged: IDL.Record({ current_allowance: Icrc1Tokens }),
    CreatedInFuture: IDL.Record({ ledger_time: IDL.Nat64 }),
    TooOld: IDL.Null,
    Expired: IDL.Record({ ledger_time: IDL.Nat64 }),
    InsufficientFunds: IDL.Record({ balance: Icrc1Tokens }),
  })
  const ApproveResult = IDL.Variant({
    Ok: Icrc1BlockIndex,
    Err: ApproveError,
  })
  const BlockIndex = IDL.Nat64
  const GetBlocksArgs = IDL.Record({
    start: BlockIndex,
    length: IDL.Nat64,
  })
  const Memo = IDL.Nat64
  const Operation = IDL.Variant({
    Approve: IDL.Record({
      fee: Tokens,
      from: AccountIdentifier,
      allowance_e8s: IDL.Int,
      allowance: Tokens,
      expires_at: IDL.Opt(TimeStamp),
      spender: AccountIdentifier,
    }),
    Burn: IDL.Record({
      from: AccountIdentifier,
      amount: Tokens,
      spender: IDL.Opt(AccountIdentifier),
    }),
    Mint: IDL.Record({ to: AccountIdentifier, amount: Tokens }),
    Transfer: IDL.Record({
      to: AccountIdentifier,
      fee: Tokens,
      from: AccountIdentifier,
      amount: Tokens,
    }),
    TransferFrom: IDL.Record({
      to: AccountIdentifier,
      fee: Tokens,
      from: AccountIdentifier,
      amount: Tokens,
      spender: AccountIdentifier,
    }),
  })
  const Transaction = IDL.Record({
    memo: Memo,
    icrc1_memo: IDL.Opt(IDL.Vec(IDL.Nat8)),
    operation: IDL.Opt(Operation),
    created_at_time: TimeStamp,
  })
  const Block = IDL.Record({
    transaction: Transaction,
    timestamp: TimeStamp,
    parent_hash: IDL.Opt(IDL.Vec(IDL.Nat8)),
  })
  const BlockRange = IDL.Record({ blocks: IDL.Vec(Block) })
  const QueryArchiveError = IDL.Variant({
    BadFirstBlockIndex: IDL.Record({
      requested_index: BlockIndex,
      first_valid_index: BlockIndex,
    }),
    Other: IDL.Record({
      error_message: IDL.Text,
      error_code: IDL.Nat64,
    }),
  })
  const QueryArchiveResult = IDL.Variant({
    Ok: BlockRange,
    Err: QueryArchiveError,
  })
  const QueryArchiveFn = IDL.Func(
    [GetBlocksArgs],
    [QueryArchiveResult],
    ["query"],
  )
  const ArchivedBlocksRange = IDL.Record({
    callback: QueryArchiveFn,
    start: BlockIndex,
    length: IDL.Nat64,
  })
  const QueryBlocksResponse = IDL.Record({
    certificate: IDL.Opt(IDL.Vec(IDL.Nat8)),
    blocks: IDL.Vec(Block),
    chain_length: IDL.Nat64,
    first_block_index: BlockIndex,
    archived_blocks: IDL.Vec(ArchivedBlocksRange),
  })
  const ArchivedEncodedBlocksRange = IDL.Record({
    callback: IDL.Func(
      [GetBlocksArgs],
      [
        IDL.Variant({
          Ok: IDL.Vec(IDL.Vec(IDL.Nat8)),
          Err: QueryArchiveError,
        }),
      ],
      ["query"],
    ),
    start: IDL.Nat64,
    length: IDL.Nat64,
  })
  const QueryEncodedBlocksResponse = IDL.Record({
    certificate: IDL.Opt(IDL.Vec(IDL.Nat8)),
    blocks: IDL.Vec(IDL.Vec(IDL.Nat8)),
    chain_length: IDL.Nat64,
    first_block_index: IDL.Nat64,
    archived_blocks: IDL.Vec(ArchivedEncodedBlocksRange),
  })
  const SendArgs = IDL.Record({
    to: TextAccountIdentifier,
    fee: Tokens,
    memo: Memo,
    from_subaccount: IDL.Opt(SubAccount),
    created_at_time: IDL.Opt(TimeStamp),
    amount: Tokens,
  })
  const TransferArgs = IDL.Record({
    to: AccountIdentifier,
    fee: Tokens,
    memo: Memo,
    from_subaccount: IDL.Opt(SubAccount),
    created_at_time: IDL.Opt(TimeStamp),
    amount: Tokens,
  })
  const TransferError = IDL.Variant({
    TxTooOld: IDL.Record({ allowed_window_nanos: IDL.Nat64 }),
    BadFee: IDL.Record({ expected_fee: Tokens }),
    TxDuplicate: IDL.Record({ duplicate_of: BlockIndex }),
    TxCreatedInFuture: IDL.Null,
    InsufficientFunds: IDL.Record({ balance: Tokens }),
  })
  const TransferResult = IDL.Variant({
    Ok: BlockIndex,
    Err: TransferError,
  })
  const TransferFeeArg = IDL.Record({})
  const TransferFee = IDL.Record({ transfer_fee: Tokens })
  const AllowanceDetail = IDL.Record({
    from_account: Account,
    to_spender: Account,
    allowance: IDL.Nat,
    expires_at: IDL.Opt(IDL.Nat64),
  })
  const GetAllowancesError = IDL.Variant({
    GenericError: IDL.Record({
      message: IDL.Text,
      error_code: IDL.Nat,
    }),
    AccessDenied: IDL.Record({ reason: IDL.Text }),
  })
  const GetAllowancesArgsICP = IDL.Record({
    prev_spender_id: IDL.Opt(IDL.Text),
    from_account_id: IDL.Text,
    take: IDL.Opt(IDL.Nat64),
  })

  const GetAllowancesArgs = IDL.Record({
    take: IDL.Opt(IDL.Nat),
    prev_spender: IDL.Opt(Account),
    from_account: IDL.Opt(Account),
  })
  const AllowanceResult = IDL.Variant({
    Ok: IDL.Vec(AllowanceDetail),
    Err: GetAllowancesError,
  })
  const RemoveApprovalArgs = IDL.Record({
    fee: IDL.Opt(IDL.Nat),
    from_subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
    spender: IDL.Vec(IDL.Nat8),
  })
  const Result_2 = IDL.Variant({ Ok: IDL.Nat, Err: ApproveError })
  return IDL.Service({
    account_balance: IDL.Func([AccountBalanceArgs], [Tokens], ["query"]),
    account_balance_dfx: IDL.Func([AccountBalanceArgsDfx], [Tokens], ["query"]),
    archives: IDL.Func([], [Archives], ["query"]),
    decimals: IDL.Func([], [IDL.Record({ decimals: IDL.Nat32 })], ["query"]),
    icrc1_balance_of: IDL.Func([Account], [Icrc1Tokens], ["query"]),
    icrc1_decimals: IDL.Func([], [IDL.Nat8], ["query"]),
    icrc1_fee: IDL.Func([], [Icrc1Tokens], ["query"]),
    icrc1_metadata: IDL.Func(
      [],
      [IDL.Vec(IDL.Tuple(IDL.Text, Value))],
      ["query"],
    ),
    icrc1_minting_account: IDL.Func([], [IDL.Opt(Account)], ["query"]),
    icrc1_name: IDL.Func([], [IDL.Text], ["query"]),
    icrc1_supported_standards: IDL.Func(
      [],
      [IDL.Vec(IDL.Record({ url: IDL.Text, name: IDL.Text }))],
      ["query"],
    ),
    icrc1_symbol: IDL.Func([], [IDL.Text], ["query"]),
    icrc1_total_supply: IDL.Func([], [Icrc1Tokens], ["query"]),
    icrc1_transfer: IDL.Func([TransferArg], [Icrc1TransferResult], []),
    icrc2_allowance: IDL.Func([AllowanceArgs], [Allowance_1], ["query"]),
    icrc2_approve: IDL.Func([ApproveArgs], [ApproveResult], []),
    icrc103_get_allowances: IDL.Func(
      [GetAllowancesArgs],
      [AllowanceResult],
      ["query"],
    ),

    name: IDL.Func([], [IDL.Record({ name: IDL.Text })], ["query"]),
    query_blocks: IDL.Func([GetBlocksArgs], [QueryBlocksResponse], ["query"]),
    query_encoded_blocks: IDL.Func(
      [GetBlocksArgs],
      [QueryEncodedBlocksResponse],
      ["query"],
    ),
    send_dfx: IDL.Func([SendArgs], [BlockIndex], []),
    symbol: IDL.Func([], [IDL.Record({ symbol: IDL.Text })], ["query"]),
    transfer: IDL.Func([TransferArgs], [TransferResult], []),
    transfer_fee: IDL.Func([TransferFeeArg], [TransferFee], ["query"]),
    get_allowances: IDL.Func(
      [GetAllowancesArgsICP],
      [IDL.Vec(Allowance)],
      ["query"],
    ),
    remove_approval: IDL.Func([RemoveApprovalArgs], [Result_2], []),
  })
}
export const init = ({ IDL }: any) => {
  return []
}
