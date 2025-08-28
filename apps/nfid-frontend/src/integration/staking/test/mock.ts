import {
  CKBTC_CANISTER_ID,
  CKETH_CANISTER_ID,
  ICP_CANISTER_ID,
  NFIDW_CANISTER_ID,
} from "@nfid/integration/token/constants"

export const mockFt = [
  {
    ledger: NFIDW_CANISTER_ID,
    name: "NFIDW",
    symbol: "NFIDW",
    logo: "Some NFIDW",
    index: "mgfru-oqaaa-aaaaq-aaelq-cai",
    state: "Active",
    category: "Sns",
    fee: BigInt(10000),
    decimals: 8,
    rootCanisterId: "m2blf-zqaaa-aaaaq-aaejq-cai",
  },
  {
    ledger: ICP_CANISTER_ID,
    name: "Internet Computer",
    symbol: "ICP",
    logo: "Some ICP",
    index: "qhbym-qaaaa-aaaaa-aaafq-cai",
    state: "Active",
    category: "Native",
    fee: BigInt(10000),
    decimals: 8,
    rootCanisterId: "r7inp-6aaaa-aaaaa-aaabq-cai",
  },
  {
    ledger: CKBTC_CANISTER_ID,
    name: "ckBTC",
    symbol: "ckBTC",
    index: "",
    state: "Active",
    category: "ChainFusion",
    fee: BigInt(1000),
    decimals: 8,
  },
  {
    ledger: CKETH_CANISTER_ID,
    name: "ckETH",
    symbol: "ckETH",
    index: "",
    state: "Active",
    category: "ChainFusion",
    fee: BigInt(2000000000000),
    decimals: 18,
  },
]

export const mockStake = [
  {
    id: [
      {
        id: new Uint8Array([
          7, 219, 158, 203, 166, 229, 18, 122, 248, 169, 214, 64, 121, 235, 114,
          123, 80, 4, 241, 133, 192, 70, 228, 250, 221, 111, 171, 251, 63, 203,
          40, 165,
        ]),
      },
    ],
    staked_maturity_e8s_equivalent: [],
    permissions: [
      {
        principal: [
          {
            __principal__:
              "ayigd-u23ly-o65by-pzgtm-udimh-ktcue-hyzwp-uqccr-t3vl4-b3mxe-bae",
          },
        ],
        permission_type: {
          "0": 0,
          "1": 1,
          "2": 2,
          "3": 3,
          "4": 4,
          "5": 5,
          "6": 6,
          "7": 7,
          "8": 8,
          "9": 9,
          "10": 10,
        },
      },
    ],
    maturity_e8s_equivalent: BigInt(0),
    cached_neuron_stake_e8s: BigInt(500000000),
    created_timestamp_seconds: BigInt(1742298123),
    source_nns_neuron_id: [],
    auto_stake_maturity: [],
    aging_since_timestamp_seconds: BigInt(1742298125),
    dissolve_state: [
      {
        DissolveDelaySeconds: BigInt(18144000),
      },
    ],
    voting_power_percentage_multiplier: BigInt(100),
    vesting_period_seconds: [],
    disburse_maturity_in_progress: [],
    followees: [
      [
        BigInt(1),
        {
          followees: [
            { id: new Uint8Array([10]) },
            { id: new Uint8Array([20]) },
          ],
        },
      ],
      [
        BigInt(2),
        {
          followees: [{ id: new Uint8Array([30]) }],
        },
      ],
    ],
    neuron_fees_e8s: BigInt(0),
  },
  {
    id: [
      {
        id: new Uint8Array([
          3, 219, 158, 203, 166, 229, 18, 122, 248, 169, 214, 64, 121, 235, 114,
          123, 80, 4, 241, 133, 192, 70, 228, 250, 221, 111, 171, 251, 63, 203,
          40, 165,
        ]),
      },
    ],
    staked_maturity_e8s_equivalent: [],
    permissions: [
      {
        principal: [
          {
            __principal__:
              "ayigd-u23ly-o65by-pzgtm-udimh-ktcue-hyzwp-uqccr-t3vl4-b3mxe-bae",
          },
        ],
        permission_type: {
          "0": 0,
          "1": 1,
          "2": 2,
          "3": 3,
          "4": 4,
          "5": 5,
          "6": 6,
          "7": 7,
          "8": 8,
          "9": 9,
          "10": 10,
        },
      },
    ],
    maturity_e8s_equivalent: BigInt(0),
    cached_neuron_stake_e8s: BigInt(600000000),
    created_timestamp_seconds: BigInt(1742298123),
    source_nns_neuron_id: [],
    auto_stake_maturity: [],
    aging_since_timestamp_seconds: BigInt(1742298125),
    dissolve_state: [
      {
        WhenDissolvedTimestampSeconds: BigInt(1761043067),
      },
    ],
    voting_power_percentage_multiplier: BigInt(100),
    vesting_period_seconds: [],
    disburse_maturity_in_progress: [],
    followees: [
      [
        BigInt(1),
        {
          followees: [
            { id: new Uint8Array([10]) },
            { id: new Uint8Array([20]) },
          ],
        },
      ],
      [
        BigInt(2),
        {
          followees: [{ id: new Uint8Array([30]) }],
        },
      ],
    ],
    neuron_fees_e8s: BigInt(0),
  },
  {
    id: [
      {
        id: new Uint8Array([
          4, 219, 158, 203, 166, 229, 18, 122, 248, 169, 214, 64, 121, 235, 114,
          123, 80, 4, 241, 133, 192, 70, 228, 250, 221, 111, 171, 251, 63, 203,
          40, 165,
        ]),
      },
    ],
    staked_maturity_e8s_equivalent: [BigInt(100000000)],
    permissions: [
      {
        principal: [
          {
            __principal__:
              "ayigd-u23ly-o65by-pzgtm-udimh-ktcue-hyzwp-uqccr-t3vl4-b3mxe-bae",
          },
        ],
        permission_type: {
          "0": 0,
          "1": 1,
          "2": 2,
          "3": 3,
          "4": 4,
          "5": 5,
          "6": 6,
          "7": 7,
          "8": 8,
          "9": 9,
          "10": 10,
        },
      },
    ],
    maturity_e8s_equivalent: BigInt(0),
    cached_neuron_stake_e8s: BigInt(700000000),
    created_timestamp_seconds: BigInt(1722298123),
    source_nns_neuron_id: [],
    auto_stake_maturity: [true],
    aging_since_timestamp_seconds: BigInt(1742298125),
    dissolve_state: [
      {
        WhenDissolvedTimestampSeconds: BigInt(
          Math.floor(Date.now() / 1000) - 10,
        ),
      },
    ],
    voting_power_percentage_multiplier: BigInt(100),
    vesting_period_seconds: [],
    disburse_maturity_in_progress: [],
    followees: [
      [
        BigInt(1),
        {
          followees: [
            { id: new Uint8Array([10]) },
            { id: new Uint8Array([20]) },
          ],
        },
      ],
      [
        BigInt(2),
        {
          followees: [{ id: new Uint8Array([30]) }],
        },
      ],
    ],
    neuron_fees_e8s: BigInt(0),
  },
]
