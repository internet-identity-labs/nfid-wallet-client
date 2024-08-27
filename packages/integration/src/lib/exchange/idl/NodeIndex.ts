export const idlFactory = ({ IDL }: any) => {
  const TransactionType = IDL.Variant({
    decreaseLiquidity: IDL.Null,
    claim: IDL.Null,
    swap: IDL.Null,
    addLiquidity: IDL.Null,
    increaseLiquidity: IDL.Null,
  });
  const Transaction = IDL.Record({
    to: IDL.Text,
    action: TransactionType,
    token0Id: IDL.Text,
    token1Id: IDL.Text,
    liquidityTotal: IDL.Nat,
    from: IDL.Text,
    hash: IDL.Text,
    tick: IDL.Int,
    token1Price: IDL.Float64,
    recipient: IDL.Text,
    token0ChangeAmount: IDL.Float64,
    sender: IDL.Text,
    liquidityChange: IDL.Nat,
    token1Standard: IDL.Text,
    token0Fee: IDL.Float64,
    token1Fee: IDL.Float64,
    timestamp: IDL.Int,
    token1ChangeAmount: IDL.Float64,
    token1Decimals: IDL.Float64,
    token0Standard: IDL.Text,
    amountUSD: IDL.Float64,
    amountToken0: IDL.Float64,
    amountToken1: IDL.Float64,
    poolFee: IDL.Nat,
    token0Symbol: IDL.Text,
    token0Decimals: IDL.Float64,
    token0Price: IDL.Float64,
    token1Symbol: IDL.Text,
    poolId: IDL.Text,
  });
  const NatResult = IDL.Variant({ ok: IDL.Nat, err: IDL.Text });
  const PublicPoolOverView = IDL.Record({
    id: IDL.Nat,
    token0TotalVolume: IDL.Float64,
    volumeUSD1d: IDL.Float64,
    volumeUSD7d: IDL.Float64,
    token0Id: IDL.Text,
    token1Id: IDL.Text,
    token1Volume24H: IDL.Float64,
    totalVolumeUSD: IDL.Float64,
    sqrtPrice: IDL.Float64,
    pool: IDL.Text,
    tick: IDL.Int,
    liquidity: IDL.Nat,
    token1Price: IDL.Float64,
    feeTier: IDL.Nat,
    token1TotalVolume: IDL.Float64,
    volumeUSD: IDL.Float64,
    feesUSD: IDL.Float64,
    token0Volume24H: IDL.Float64,
    token1Standard: IDL.Text,
    txCount: IDL.Nat,
    token1Decimals: IDL.Float64,
    token0Standard: IDL.Text,
    token0Symbol: IDL.Text,
    token0Decimals: IDL.Float64,
    token0Price: IDL.Float64,
    token1Symbol: IDL.Text,
  });
  const PublicTokenOverview = IDL.Record({
    id: IDL.Nat,
    volumeUSD1d: IDL.Float64,
    volumeUSD7d: IDL.Float64,
    totalVolumeUSD: IDL.Float64,
    name: IDL.Text,
    volumeUSD: IDL.Float64,
    feesUSD: IDL.Float64,
    priceUSDChange: IDL.Float64,
    address: IDL.Text,
    txCount: IDL.Int,
    priceUSD: IDL.Float64,
    standard: IDL.Text,
    symbol: IDL.Text,
  });
  const Address = IDL.Text;
  return IDL.Service({
    addOwner: IDL.Func([IDL.Principal], [], []),
    addQuoteToken: IDL.Func([IDL.Text, IDL.Bool], [], []),
    allPoolStorage: IDL.Func([], [IDL.Vec(IDL.Text)], ["query"]),
    allTokenStorage: IDL.Func([], [IDL.Vec(IDL.Text)], ["query"]),
    allUserStorage: IDL.Func([], [IDL.Vec(IDL.Text)], ["query"]),
    batchInsert: IDL.Func([IDL.Vec(Transaction)], [], []),
    clean: IDL.Func([], [], []),
    cycleAvailable: IDL.Func([], [NatResult], []),
    cycleBalance: IDL.Func([], [NatResult], ["query"]),
    getAllPools: IDL.Func([], [IDL.Vec(PublicPoolOverView)], ["query"]),
    getAllTokens: IDL.Func([], [IDL.Vec(PublicTokenOverview)], ["query"]),
    getControllers: IDL.Func([], [IDL.Vec(IDL.Principal)], ["query"]),
    getDataQueueSize: IDL.Func([], [IDL.Nat], ["query"]),
    getLastDataTime: IDL.Func([], [IDL.Int], ["query"]),
    getOwners: IDL.Func([], [IDL.Vec(IDL.Principal)], ["query"]),
    getPoolQueueSize: IDL.Func(
      [],
      [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Nat))],
      ["query"]
    ),
    getPoolsForToken: IDL.Func(
      [IDL.Text],
      [IDL.Vec(PublicPoolOverView)],
      ["query"]
    ),
    getQuoteTokens: IDL.Func([], [IDL.Vec(IDL.Text)], ["query"]),
    getSyncLock: IDL.Func([], [IDL.Bool], ["query"]),
    getSyncStatus: IDL.Func(
      [],
      [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Bool, IDL.Text))],
      ["query"]
    ),
    getTokenQueueSize: IDL.Func(
      [],
      [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Nat))],
      ["query"]
    ),
    getTotalVolumeAndUser: IDL.Func([], [IDL.Float64, IDL.Nat], ["query"]),
    getUserQueueSize: IDL.Func(
      [],
      [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Nat))],
      ["query"]
    ),
    insert: IDL.Func([Transaction], [], []),
    poolMapping: IDL.Func(
      [],
      [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text))],
      ["query"]
    ),
    poolStorage: IDL.Func([IDL.Text], [IDL.Opt(IDL.Text)], ["query"]),
    setPoolSyncStatus: IDL.Func([IDL.Bool], [IDL.Bool], []),
    setQuoteTokens: IDL.Func([IDL.Vec(IDL.Text), IDL.Bool], [], []),
    setTokenSyncStatus: IDL.Func([IDL.Bool], [IDL.Bool], []),
    setUserSyncStatus: IDL.Func([IDL.Bool], [IDL.Bool], []),
    syncOverview: IDL.Func([], [], []),
    tokenMapping: IDL.Func(
      [],
      [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text))],
      ["query"]
    ),
    tokenStorage: IDL.Func([IDL.Text], [IDL.Opt(IDL.Text)], ["query"]),
    userMapping: IDL.Func(
      [],
      [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text))],
      ["query"]
    ),
    userStorage: IDL.Func([Address], [IDL.Opt(IDL.Text)], ["query"]),
  });
};
