/**
 * @jest-environment jsdom
 */
import { DelegationIdentity, Ed25519KeyIdentity } from "@dfinity/identity"
import { JsonnableEd25519KeyIdentity } from "@dfinity/identity/lib/cjs/identity/ed25519"
import { ethers } from "ethers"
import axios from 'axios';

import {
  btcWallet,
  generateDelegationIdentity,
  getEcdsaPublicKey, ic,
  mockIdentityA,
  replaceActorIdentity,
  replaceIdentity,
  vault
} from "@nfid/integration";

import { btcWallet as btcAPI } from "../actors"
import { getBalance, getBitcoinAddress } from "./index";

const idd: JsonnableEd25519KeyIdentity = [
  "0402f7e13e782ad8bb2c4da69d00c14af52d4bf0f1cc20ddb52f117d7fff2e3678c950145102d87915c5688a218cdc4348407cd7b1fdb8256dade044309a2552cd",
  "fa1e290e2524ec98e24e49e95c0e30b43e9c96504715cea4d802269f80f638e6",
]

describe("BTC suite", () => {
  jest.setTimeout(200000)
  it("get btc address", async () => {
    const mockedIdentity = Ed25519KeyIdentity.fromParsedJson(mockIdentityA)

    const delegationIdentity: DelegationIdentity =
      await generateDelegationIdentity(mockedIdentity)
    replaceActorIdentity(btcWallet, delegationIdentity)
    // const pk = await getBitcoinAddress()
    // console.log(pk)
    const address = 'mpEsrvBZnefm6QQLF1rn2trTp1UbrLaKhG';
    const txs = await getTransactionHistory(address, undefined, 10);
    console.log("1123123123123123123123123");
    console.log(txs);

  })
})

interface MempoolTransaction {
  txid: string;
  time: number;
  value: number;
  inputs: { addresses: string; value: number }[];
  outputs: { addresses: string; value: number }[];
}

interface MempoolTransactionResponse {
  txid: string;
  status: {
    block_time: string;
  };
  vin: { prevout: { scriptpubkey_address: string; value: number } }[];
  vout: { scriptpubkey_address: string; value: number }[];
}

interface FungibleActivityRecords {
  cursor?: string;
  activities: FungibleActivityRecord[];
}

interface FungibleActivityRecord {
  id: string;
  date: string;
  to: string;
  from: string;
  transactionHash: string;
  price: number;
}

async function getTransactionHistory(
  address: string,
  lastSeenTxId: string | undefined,
  pageSize: number
): Promise<FungibleActivityRecords> {
  const activities: FungibleActivityRecord[] = [];
  let cursor = lastSeenTxId;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    let url = `https://mempool.space/testnet/api/address/${address}/txs?`;


    if (lastSeenTxId) {
      url += `?last_seen_txid=${lastSeenTxId}`;
    }
    const response = await fetch(url);
    const json: MempoolTransactionResponse[] = await response.json();

    const newActivities = json.map((tx: MempoolTransactionResponse) => {
      const inputs = tx.vin.map((input) => {
        return {
          addresses: input.prevout.scriptpubkey_address,
          value: input.prevout.value,
        };
      });
      const outputs = tx.vout.map((output) => {
        return {
          addresses: output.scriptpubkey_address,
          value: output.value,
        };
      });

      const isIncome = inputs.some((input) => input.addresses === address);
      const isOutcome = outputs.some((output) => output.addresses === address);

      if (!isIncome && !isOutcome) {
        return null;
      }

      const transactionValue = inputs.reduce((total: number, input: any) => {
        if (input.addresses === address) {
          return total + input.value;
        }
        return total;
      }, 0) - outputs.reduce((total: number, output: any) => {
        if (output.addresses === address) {
          return total + output.value;
        }
        return total;
      }, 0);

      const from = isOutcome ? address : '';
      const to = isIncome ? address : '';
      const date = new Date(tx.status.block_time).toISOString();
      const price = transactionValue;

      return {
        id: tx.txid,
        date,
        to,
        from,
        transactionHash: tx.txid,
        price,
      };
    }).filter((tx: FungibleActivityRecord | null) => tx !== null);

    if (newActivities.length === 0) {
      break;
    }

    // @ts-ignore
    activities.push(...newActivities);

    if (json.length < pageSize) {
      break;
    }
    console.log(json)
    cursor = json[json.length - 1].txid;
  }

  return { activities, cursor };
}

