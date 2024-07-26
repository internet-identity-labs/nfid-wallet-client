import {
  ListTransactionRecord, SellTransactionRecord,
  TransactionRecordView,
} from "src/integration/nft/impl/nft-transaction-record"
import {TransactionRecordData} from "src/integration/nft/impl/yumi/transaction/yumi-trs-types";

export class ListTransactionRecordYumi implements ListTransactionRecord {
  private readonly from: string
  private readonly date: Date
  private readonly price: string

  constructor(rawTransaction: TransactionRecordData) {
    if (rawTransaction.eventType.toLowerCase() !== "list") {
      throw new Error("Invalid transaction type")
    }
    //from - princ // fromAid = account id
    this.from = rawTransaction.fromAid!
    const milliseconds = BigInt(rawTransaction.created_at) / BigInt(1_000_000);
    this.date = new Date(Number(milliseconds));
    this.price = rawTransaction.token_amount + " " + rawTransaction.token_symbol;
  }

  getTransactionView(): TransactionRecordView {
    return {
      type: "List",
      date: this.date.toISOString(),
      from: this.from,
      to: undefined,
      price: this.price
    };
  }
}

export class SoldTransactionRecordYumi implements SellTransactionRecord {
  private readonly from: string
  private readonly to: string
  private readonly date: Date
  private readonly price: string

  constructor(rawTransaction: TransactionRecordData) {
    if (rawTransaction.eventType.toLowerCase() !== "sold") {
      throw new Error("Invalid transaction type")
    }
    //from - princ // fromAid - account id
    this.from = rawTransaction.fromAid!
    this.to = rawTransaction.toAid!
    const milliseconds = BigInt(rawTransaction.created_at) / BigInt(1_000_000);
    this.date = new Date(Number(milliseconds));
    this.price = rawTransaction.token_amount + " " + rawTransaction.token_symbol;
  }

  getTransactionView(): TransactionRecordView {
    return {
      type: "Sale",
      date: this.date.toISOString(),
      from: this.from,
      to: this.to,
      price: this.price
    };
  }
}
