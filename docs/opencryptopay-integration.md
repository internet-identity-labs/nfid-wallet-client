# OpenCryptoPay — Integration Service

## 1. Overview

**OpenCryptoPay** is an open crypto payment standard based on LNURL-pay.
The wallet scans a QR code → fetches payment details → signs and submits a transaction.

The integration lives in `apps/nfid-frontend/src/integration/opencryptopay/`.

---

## 2. Payment Flow

```
Scan QR → Decode LNURL → GET /lnurlp/{id} → Select asset → GET /lnurlp/cb/{id} → Sign TX → Submit TX
```

---

## 3. File Structure

```
apps/nfid-frontend/src/integration/opencryptopay/
├── opencryptopay.service.ts     # OpenCryptoPayService
├── types.ts                     # All types and interfaces
├── lnurl-decoder.ts             # bech32 decoder
└── errors.ts                    # OCP-specific errors
```

---

## 4. Types

```typescript
// types.ts

// ── Supported Networks ──

type OCPNetwork =
  | "Ethereum"
  | "Polygon"
  | "Arbitrum"
  | "Base"
  | "BNB"
  | "Bitcoin"
  | "ICP"

// ── API Response Types ──

interface OCPPayRequest {
  tag: "payRequest"
  callback: string // URL to fetch a quote from
  minSendable: number // min amount in millisatoshi (LNURL standard)
  maxSendable: number // max amount in millisatoshi
  metadata: string // JSON-encoded metadata (recipient name, etc.)
  currencies: OCPCurrency[] // available cryptocurrencies for payment
}

interface OCPCurrency {
  name: string // "Ethereum", "Internet Computer", etc.
  network: OCPNetwork // network to send on
  symbol: string // "ETH", "ICP", "BTC", etc.
  decimals: number // decimal places (18 for ETH, 8 for ICP/BTC)
  minSendable: number // min amount in native units
  maxSendable: number // max amount in native units
  convertedMultiplier?: number // exchange rate to the base currency
}

interface OCPQuote {
  id: string // quote identifier (used for submit)
  expiresAt: string // ISO 8601 expiration time
  amount: string // amount to send in native units
  fee: string // OCP provider fee
  method: OCPNetwork // network
  asset: string // asset symbol
  targetAddress: string // recipient address
}

interface OCPCallbackResponse {
  pr: string // payment request (empty for on-chain)
  routes: unknown[] // routes (for Lightning)
  quote: OCPQuote
}

interface OCPSubmitRequest {
  quoteId: string // quote ID from OCPQuote.id
  method: OCPNetwork // network (must match quote.method)
  rawTx: string // signed transaction in hex
  txId: string // transaction hash
}

interface OCPSubmitResponse {
  status: "ok" | "error"
  message?: string // error message (when status === "error")
}

// ── Internal Service Types ──

interface OCPPaymentSummary {
  recipientName: string // recipient name (from metadata)
  currency: OCPCurrency // selected currency
  quote: OCPQuote // active quote
  networkFee: string // network fee (ETH gas, ICP fee, BTC fee)
  totalAmount: string // amount + fee + networkFee
  totalAmountUSD: string // USD equivalent
  quoteExpiresIn: number // seconds until quote expiration
}
```

---

## 5. OpenCryptoPayService Interface

```typescript
// opencryptopay.service.ts

class OpenCryptoPayService {
  // ══════════════════════════════════════════
  //  LNURL DECODING
  // ══════════════════════════════════════════

  /**
   * Decodes a bech32-encoded LNURL string into an HTTPS URL.
   *
   * @param lnurl - bech32 string from the QR code (starts with "lnurl1...")
   * @returns HTTPS URL of the payment endpoint
   * @throws OCPInvalidLnurlError - if the string is not valid bech32 or the result is not HTTPS
   */
  decodeLnurl(lnurl: string): string

  // ══════════════════════════════════════════
  //  PAYMENT DETAILS
  // ══════════════════════════════════════════

  /**
   * Fetches payment details from the OCP endpoint.
   *
   * GET {paymentUrl}
   *
   * @param paymentUrl - HTTPS URL obtained from decodeLnurl()
   * @returns payment details with available currencies
   * @throws OCPNetworkError - if the request failed (timeout, network unavailable)
   * @throws OCPInvalidResponseError - if the response does not match OCPPayRequest format
   */
  async getPaymentDetails(paymentUrl: string): Promise<OCPPayRequest>

  // ══════════════════════════════════════════
  //  CURRENCY FILTERING
  // ══════════════════════════════════════════

  /**
   * Filters OCP currencies by wallet-supported networks
   * and sufficient user balance.
   *
   * Filtering logic:
   * 1. Network is supported by the wallet (FT implementation exists)
   * 2. User balance > 0
   * 3. Balance >= currency.minSendable + estimated network fee
   *
   * @param currencies - currency array from OCPPayRequest.currencies
   * @param identity - user identity for balance lookups
   * @returns filtered array of currencies available for payment
   */
  async getAvailableCurrencies(
    currencies: OCPCurrency[],
    identity: SignIdentity,
  ): Promise<OCPCurrency[]>

  // ══════════════════════════════════════════
  //  QUOTE
  // ══════════════════════════════════════════

  /**
   * Requests a quote for the selected currency and amount.
   *
   * GET {callbackUrl}?amount={amount}&currency={currency}
   *
   * @param callbackUrl - URL from OCPPayRequest.callback
   * @param amount - amount in millisatoshi (from OCPPayRequest)
   * @param currency - currency symbol ("ETH", "BTC", "ICP", etc.)
   * @returns quote with recipient address, amount, and expiration
   * @throws OCPNetworkError - network error
   * @throws OCPCurrencyNotSupportedError - currency not supported by OCP provider
   * @throws OCPAmountOutOfRangeError - amount outside [minSendable, maxSendable]
   */
  async getQuote(
    callbackUrl: string,
    amount: number,
    currency: string,
  ): Promise<OCPQuote>

  /**
   * Checks whether a quote has expired.
   *
   * @param quote - quote to check
   * @returns true if current time >= quote.expiresAt
   */
  isQuoteExpired(quote: OCPQuote): boolean

  // ══════════════════════════════════════════
  //  PAYMENT SUMMARY
  // ══════════════════════════════════════════

  /**
   * Builds a complete payment summary for display to the user.
   *
   * Includes:
   * - recipient name (parsed from OCPPayRequest.metadata)
   * - amount in the native asset and in USD
   * - OCP provider fee (quote.fee)
   * - network fee (gas/fee from the corresponding service)
   * - total to be debited
   *
   * @param payRequest - original payment request
   * @param currency - selected currency
   * @param quote - active quote
   * @param identity - identity for network fee estimation
   * @returns payment summary for the UI
   * @throws OCPQuoteExpiredError - if the quote has expired
   */
  async getPaymentSummary(
    payRequest: OCPPayRequest,
    currency: OCPCurrency,
    quote: OCPQuote,
    identity: SignIdentity,
  ): Promise<OCPPaymentSummary>

  // ══════════════════════════════════════════
  //  TRANSACTION EXECUTION
  // ══════════════════════════════════════════

  /**
   * Executes the full payment cycle:
   * 1. Verifies the quote has not expired
   * 2. Builds a transaction for the target network
   * 3. Signs via the corresponding service (EVM/BTC/ICP)
   * 4. Submits the transaction to the blockchain
   * 5. Reports txId and rawTx to the OCP callback
   *
   * Network-to-signing-service mapping:
   * - Ethereum/Polygon/Arbitrum/Base/BNB → EvmService (ethers.js)
   * - Bitcoin → BitcoinService (chain-fusion signer)
   * - ICP → ICRC1 transfer via @dfinity/ledger-icrc
   *
   * @param quote - active (non-expired) quote
   * @param identity - identity for transaction signing
   * @returns OCP submit result
   * @throws OCPQuoteExpiredError - quote expired before signing began
   * @throws OCPInsufficientBalanceError - balance insufficient (including network fee)
   * @throws OCPTransactionSignError - transaction signing error
   * @throws OCPSubmitError - OCP returned an error on submit
   * @throws OCPNetworkError - network error during submit
   */
  async executePayment(
    quote: OCPQuote,
    identity: SignIdentity,
  ): Promise<OCPSubmitResponse>

  // ══════════════════════════════════════════
  //  ADDRESS VALIDATION
  // ══════════════════════════════════════════

  /**
   * Validates a targetAddress from the quote for the given network.
   *
   * - EVM networks: ethers.isAddress()
   * - Bitcoin: bitcoin-address-validation
   * - ICP: Principal.fromText() / Account ID validation
   *
   * @param address - recipient address
   * @param network - network
   * @returns true if the address is valid for the given network
   */
  validateTargetAddress(address: string, network: OCPNetwork): boolean
}
```

---

## 6. Errors

```typescript
// errors.ts

class OCPError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message)
  }
}

class OCPInvalidLnurlError extends OCPError {
  // bech32 string cannot be decoded or result is not an HTTPS URL
  constructor(lnurl: string)
}

class OCPNetworkError extends OCPError {
  // HTTP request to OCP API failed
  constructor(url: string, public readonly statusCode?: number)
}

class OCPInvalidResponseError extends OCPError {
  // API response does not match expected schema
  constructor(url: string, public readonly response: unknown)
}

class OCPQuoteExpiredError extends OCPError {
  // Quote has expired (expiresAt < now)
  constructor(quoteId: string, expiresAt: string)
}

class OCPAmountOutOfRangeError extends OCPError {
  // Amount outside [minSendable, maxSendable]
  constructor(amount: number, min: number, max: number)
}

class OCPCurrencyNotSupportedError extends OCPError {
  // Currency not supported by OCP provider or wallet
  constructor(currency: string, network: OCPNetwork)
}

class OCPInsufficientBalanceError extends OCPError {
  // Insufficient balance (amount + fees > balance)
  constructor(
    required: string,
    available: string,
    currency: string,
  )
}

class OCPTransactionSignError extends OCPError {
  // Transaction signing error (chain-fusion, ethers, dfinity)
  constructor(network: OCPNetwork, public readonly cause: Error)
}

class OCPSubmitError extends OCPError {
  // OCP API returned an error on transaction submit
  constructor(quoteId: string, public readonly apiMessage: string)
}
```

---

## 7. Network-to-Service Mapping

| OCPNetwork   | Service                | Signing                | Address Resolution               |
| ------------ | ---------------------- | ---------------------- | -------------------------------- |
| `"Ethereum"` | `evm.service.ts`       | Ethers.js signer       | `getAddress()`                   |
| `"Polygon"`  | `polygon.service.ts`   | Ethers.js signer       | `getAddress()`                   |
| `"Arbitrum"` | `arbitrum.service.ts`  | Ethers.js signer       | `getAddress()`                   |
| `"Base"`     | `base.service.ts`      | Ethers.js signer       | `getAddress()`                   |
| `"BNB"`      | `bnb.service.ts`       | Ethers.js signer       | `getAddress()`                   |
| `"Bitcoin"`  | `bitcoin.service.ts`   | IC chain-fusion signer | `ChainFusionSigner.getAddress()` |
| `"ICP"`      | `@dfinity/ledger-icrc` | IC identity            | `Principal.from(identity)`       |

---

## 8. Dependencies

| Package  | Purpose               |
| -------- | --------------------- |
| `bech32` | LNURL decoding (~2KB) |

Everything else (`fetch`, `ethers`, `@dfinity/*`, `bitcoin-address-validation`) is already in the project.

---

## 9. Usage Example

```typescript
const ocp = new OpenCryptoPayService()

// 1. Decode QR
const paymentUrl = ocp.decodeLnurl("lnurl1dp68gurn8ghj7...")

// 2. Fetch details
const payRequest = await ocp.getPaymentDetails(paymentUrl)

// 3. Filter by balance
const currencies = await ocp.getAvailableCurrencies(
  payRequest.currencies,
  identity,
)

// 4. Get a quote for ICP
const quote = await ocp.getQuote(
  payRequest.callback,
  payRequest.minSendable,
  "ICP",
)

// 5. Build summary
const summary = await ocp.getPaymentSummary(
  payRequest,
  currencies.find((c) => c.symbol === "ICP")!,
  quote,
  identity,
)

// 6. Pay
const result = await ocp.executePayment(quote, identity)
```

---

## 10. Open Questions

1. **OCP test environment** — is there a sandbox endpoint for development?
2. **Deep links** — support for `web+lnurl://` URI scheme to open the wallet from the browser?
