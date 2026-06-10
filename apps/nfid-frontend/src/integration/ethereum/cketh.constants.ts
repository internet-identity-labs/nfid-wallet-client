export const CKETH_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_minterAddress",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "target",
        type: "address",
      },
    ],
    name: "AddressEmptyCode",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "AddressInsufficientBalance",
    type: "error",
  },
  {
    inputs: [],
    name: "FailedInnerCall",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "SafeERC20FailedOperation",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "erc20ContractAddress",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "principal",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "subaccount",
        type: "bytes32",
      },
    ],
    name: "ReceivedEthOrErc20",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "erc20Address",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "bytes32",
        name: "principal",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "subaccount",
        type: "bytes32",
      },
    ],
    name: "depositErc20",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "principal",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "subaccount",
        type: "bytes32",
      },
    ],
    name: "depositEth",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "getMinterAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const

export const CKETH_FEE = BigInt(50_000)
export const ETH_BASE_FEE = BigInt(21_000)

export const CKERC20_ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
]

export const CKERC20_DEPOSIT_FALLBACK_GAS = BigInt(150_000)
export const CKERC20_APPROVE_FALLBACK_GAS = BigInt(60_000)
export const CKERC20_DEPOSIT_SUBACCOUNT_ZERO =
  "0x0000000000000000000000000000000000000000000000000000000000000000"
