# Миграция с `@dfinity/*` на `@icp-sdk/*`

> Документ описывает миграцию монорепозитория nfid-frontend с устаревших пакетов `@dfinity/*` на новую экосистему `@icp-sdk/*` (см. <https://js.icp.build>).
>
> **Стратегия:** big-bang — все импорты, все пакеты, один PR. Обоснование: между старым и новым деревом нет совместимости типов (`Identity`, `Principal` импортируются из разных модулей и взаимно не подходят), поэтому смешанное состояние «часть пакетов мигрирована» в долгосрочной перспективе нежизнеспособно.

---

## 1. Текущее состояние

### 1.1. Версии в корневом `package.json`

```jsonc
"@dfinity/agent":              "2.4.1",
"@dfinity/auth-client":        "2.4.1",
"@dfinity/candid":             "2.4.1",
"@dfinity/ckbtc":              "3.1.14",
"@dfinity/cketh":              "3.4.12",
"@dfinity/identity":           "2.4.1",
"@dfinity/identity-secp256k1": "2.4.1",
"@dfinity/ledger-icp":         "2.6.13",
"@dfinity/ledger-icrc":        "2.10.0",
"@dfinity/nns":                "8.5.0",
"@dfinity/principal":          "2.4.1",
"@dfinity/sns":                "3.8.0",
"@dfinity/utils":              "2.14.0",
```

### 1.2. Объём затронутого кода

| Пакет                         |                                                    Файлов |
| ----------------------------- | --------------------------------------------------------: |
| `@dfinity/principal`          |                                                       142 |
| `@dfinity/agent`              |                                                       134 |
| `@dfinity/identity`           |                                                       100 |
| `@dfinity/ledger-icp`         |                                                        31 |
| `@dfinity/candid`             |                                                        21 |
| `@dfinity/utils`              |                                                        15 |
| `@dfinity/nns`                |                                                        11 |
| `@dfinity/ledger-icrc`        |                                                        11 |
| `@dfinity/ckbtc`              |                                                         5 |
| `@dfinity/sns`                |                                                         4 |
| `@dfinity/auth-client`        |                                                         4 |
| `@dfinity/identity-secp256k1` |                                                         2 |
| `@dfinity/cketh`              |                                                         1 |
| `@dfinity/nns-proto`          | **0** — не используется в коде, удалить из `package.json` |
| **Всего уникальных файлов**   |                                                  **~294** |

### 1.3. Окружение

- Node `^22.10.0` (`package.json#engines`).
- Тип модулей: `"type": "module"` (ESM).
- Требования миграционного гайда v5: dfx ≥ 0.30.1, PocketIC ≥ 11.0.0. **Проверить версии в `dfx.json` и CI перед мерджем.**

---

## 2. Целевая карта пакетов

| Старый пакет (`@dfinity/*`)   | Новый пакет (`@icp-sdk/*`)         | npm-пакет / submodule       |
| ----------------------------- | ---------------------------------- | --------------------------- |
| `@dfinity/agent`              | `@icp-sdk/core/agent`              | `@icp-sdk/core@^5.4.0`      |
| `@dfinity/candid`             | `@icp-sdk/core/candid`             | `@icp-sdk/core@^5.4.0`      |
| `@dfinity/principal`          | `@icp-sdk/core/principal`          | `@icp-sdk/core@^5.4.0`      |
| `@dfinity/identity`           | `@icp-sdk/core/identity`           | `@icp-sdk/core@^5.4.0`      |
| `@dfinity/identity-secp256k1` | `@icp-sdk/core/identity/secp256k1` | `@icp-sdk/core@^5.4.0`      |
| `@dfinity/auth-client`        | `@icp-sdk/auth/client`             | `@icp-sdk/auth@^7.1.0`      |
| `@dfinity/nns`                | `@icp-sdk/canisters/nns`           | `@icp-sdk/canisters@^3.6.0` |
| `@dfinity/sns`                | `@icp-sdk/canisters/sns`           | `@icp-sdk/canisters@^3.6.0` |
| `@dfinity/ledger-icp`         | `@icp-sdk/canisters/ledger/icp`    | `@icp-sdk/canisters@^3.6.0` |
| `@dfinity/ledger-icrc`        | `@icp-sdk/canisters/ledger/icrc`   | `@icp-sdk/canisters@^3.6.0` |
| `@dfinity/ckbtc`              | `@icp-sdk/canisters/ckbtc`         | `@icp-sdk/canisters@^3.6.0` |
| `@dfinity/cketh`              | `@icp-sdk/canisters/cketh`         | `@icp-sdk/canisters@^3.6.0` |
| `@dfinity/utils`              | **прямой замены нет**              | см. §5                      |
| `@dfinity/nns-proto`          | — (не используется)                | удалить                     |

Итоговый список новых dev-зависимостей:

```bash
pnpm add @icp-sdk/core@^5.4.0 @icp-sdk/auth@^7.1.0 @icp-sdk/canisters@^3.6.0
```

(или `npm install` / `yarn add` — на ваш package-manager).

---

## 3. Чеклист пошаговых команд (codemod)

> Команды рассчитаны на запуск из корня репозитория. Все `sed`-команды — `gsed`-совместимы (на macOS установить через `brew install gnu-sed`, либо использовать `find ... -exec perl -pi -e ...`).
>
> **Перед запуском:**
>
> ```bash
> git checkout -b feature/icp-sdk-migration
> git status   # рабочее дерево должно быть чистым
> ```

### 3.1. Установка новых зависимостей и удаление старых

```bash
# Удалить старые (включая @dfinity/utils — заменяется локальным модулем, см. §5)
pnpm remove \
  @dfinity/agent \
  @dfinity/auth-client \
  @dfinity/candid \
  @dfinity/ckbtc \
  @dfinity/cketh \
  @dfinity/identity \
  @dfinity/identity-secp256k1 \
  @dfinity/ledger-icp \
  @dfinity/ledger-icrc \
  @dfinity/nns \
  @dfinity/nns-proto \
  @dfinity/principal \
  @dfinity/sns \
  @dfinity/utils

# Установить новые
pnpm add \
  @icp-sdk/core@^5.4.0 \
  @icp-sdk/auth@^7.1.0 \
  @icp-sdk/canisters@^3.6.0
```

### 3.2. Массовая замена импортов

Используйте один из двух подходов.

**Вариант A. Perl in-place (рекомендуется, кроссплатформенно):**

```bash
# CORE (важен порядок: identity-secp256k1 раньше identity)
find . -type f \( -name '*.ts' -o -name '*.tsx' \) \
  -not -path './node_modules/*' -not -path './dist/*' -not -path './build/*' \
  -exec perl -pi -e '
    s|(["\x27])@dfinity/identity-secp256k1\1|$1\@icp-sdk/core/identity/secp256k1$1|g;
    s|(["\x27])@dfinity/agent\1|$1\@icp-sdk/core/agent$1|g;
    s|(["\x27])@dfinity/candid\1|$1\@icp-sdk/core/candid$1|g;
    s|(["\x27])@dfinity/principal\1|$1\@icp-sdk/core/principal$1|g;
    s|(["\x27])@dfinity/identity\1|$1\@icp-sdk/core/identity$1|g;
  ' {} +

# AUTH
find . -type f \( -name '*.ts' -o -name '*.tsx' \) \
  -not -path './node_modules/*' -not -path './dist/*' -not -path './build/*' \
  -exec perl -pi -e '
    s|(["\x27])@dfinity/auth-client\1|$1\@icp-sdk/auth/client$1|g;
  ' {} +

# CANISTERS
find . -type f \( -name '*.ts' -o -name '*.tsx' \) \
  -not -path './node_modules/*' -not -path './dist/*' -not -path './build/*' \
  -exec perl -pi -e '
    s|(["\x27])@dfinity/ledger-icp\1|$1\@icp-sdk/canisters/ledger/icp$1|g;
    s|(["\x27])@dfinity/ledger-icrc\1|$1\@icp-sdk/canisters/ledger/icrc$1|g;
    s|(["\x27])@dfinity/ckbtc\1|$1\@icp-sdk/canisters/ckbtc$1|g;
    s|(["\x27])@dfinity/cketh\1|$1\@icp-sdk/canisters/cketh$1|g;
    s|(["\x27])@dfinity/nns\1|$1\@icp-sdk/canisters/nns$1|g;
    s|(["\x27])@dfinity/sns\1|$1\@icp-sdk/canisters/sns$1|g;
  ' {} +
```

**Вариант B. ts-morph скрипт** (более безопасен для type-only импортов и алиасов):

```ts
// scripts/migrate-imports.ts — запустить: pnpm tsx scripts/migrate-imports.ts
import { Project } from "ts-morph"

const MAP: Record<string, string> = {
  "@dfinity/agent": "@icp-sdk/core/agent",
  "@dfinity/candid": "@icp-sdk/core/candid",
  "@dfinity/principal": "@icp-sdk/core/principal",
  "@dfinity/identity": "@icp-sdk/core/identity",
  "@dfinity/identity-secp256k1": "@icp-sdk/core/identity/secp256k1",
  "@dfinity/auth-client": "@icp-sdk/auth/client",
  "@dfinity/nns": "@icp-sdk/canisters/nns",
  "@dfinity/sns": "@icp-sdk/canisters/sns",
  "@dfinity/ledger-icp": "@icp-sdk/canisters/ledger/icp",
  "@dfinity/ledger-icrc": "@icp-sdk/canisters/ledger/icrc",
  "@dfinity/ckbtc": "@icp-sdk/canisters/ckbtc",
  "@dfinity/cketh": "@icp-sdk/canisters/cketh",
}

const project = new Project({ tsConfigFilePath: "./tsconfig.base.json" })
project.addSourceFilesAtPaths([
  "apps/**/*.ts",
  "apps/**/*.tsx",
  "packages/**/*.ts",
  "packages/**/*.tsx",
])

for (const file of project.getSourceFiles()) {
  let changed = false
  for (const decl of file.getImportDeclarations()) {
    const m = MAP[decl.getModuleSpecifierValue()]
    if (m) {
      decl.setModuleSpecifier(m)
      changed = true
    }
  }
  if (changed) file.saveSync()
}
```

### 3.3. Точечные правки API (§4) — вручную

После прогона codemod останутся 3 файла с breaking changes — см. §4.

### 3.4. Верификация

```bash
# 1. Не должно быть ни одного импорта из @dfinity/{agent,candid,...} (кроме utils если оставлен)
grep -rln "from [\"']@dfinity/\(agent\|candid\|principal\|identity\|identity-secp256k1\|auth-client\|nns\|sns\|ledger-icp\|ledger-icrc\|ckbtc\|cketh\)[\"']" \
  apps packages 2>/dev/null

# 2. Тайпчек
pnpm typecheck   # или: pnpm nx run-many -t typecheck

# 3. Тесты
pnpm test

# 4. Линт (проверить no-restricted-imports — обновить правила, если есть)
pnpm lint

# 5. Сборка
pnpm build
```

### 3.5. Обновление линт-правил

В `eslintrc`/`biome.json` добавить запрет на старые импорты, чтобы они не вернулись через cherry-pick:

```jsonc
// .eslintrc.json (пример)
{
  "rules": {
    "no-restricted-imports": [
      "error",
      {
        "patterns": [
          {
            "group": [
              "@dfinity/agent",
              "@dfinity/candid",
              "@dfinity/principal",
              "@dfinity/identity",
              "@dfinity/identity-secp256k1",
              "@dfinity/auth-client",
              "@dfinity/nns",
              "@dfinity/sns",
              "@dfinity/ledger-icp",
              "@dfinity/ledger-icrc",
              "@dfinity/ckbtc",
              "@dfinity/cketh",
            ],
            "message": "Use @icp-sdk/* instead — см. docs/migration/icp-sdk-migration.md",
          },
        ],
      },
    ],
  },
}
```

---

## 4. API mapping и точечные breaking changes

### 4.1. Изменения, требующие ручной правки

| #   | Что                                                                                        | Где                                                                                                                                                                                                                                                | Действие                                                                                 |
| --- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 1   | `v3ResponseBody` → `v4ResponseBody`                                                        | `apps/nfid-frontend/src/features/identitykit/service/call-canister.service.ts:13, 101, 102`                                                                                                                                                        | Заменить тип и cast'ы                                                                    |
| 2   | `Certificate.create({ canisterId })` → `Certificate.create({ principal: { canisterId } })` | `packages/integration/src/lib/lambda/cert-verification/index.ts:30`<br>`apps/nfid-frontend/src/features/identitykit/service/interface-factory.service.ts:85`<br>`apps/nfid-frontend/src/features/identitykit/service/call-canister.service.ts:103` | Обернуть `canisterId` в `{ principal: { canisterId } }`                                  |
| 3   | `HttpV3ApiNotSupportedErrorCode` → `HttpV4ApiNotSupportedErrorCode`                        | grep в репо после миграции импортов                                                                                                                                                                                                                | Перепроверить grep'ом после установки новых пакетов; на момент анализа в коде не найдено |

**Пример (точечный fix 2):**

```diff
- const certificate = await Certificate.create({
-   canisterId,
-   certificate: cert,
-   rootKey: agent.rootKey,
- })
+ const certificate = await Certificate.create({
+   principal: { canisterId },
+   certificate: cert,
+   rootKey: agent.rootKey,
+ })
```

### 4.2. Идентичные API (только импорт меняется)

Подавляющее большинство экспортов сохраняют сигнатуру:

- **Core / agent:** `HttpAgent`, `Actor`, `ActorMethod`, `ActorSubclass`, `Agent`, `AnonymousIdentity`, `SignIdentity`, `Identity`, `DerEncodedPublicKey`, `PublicKey`, `Signature`, `Cbor`, `Expiry`, `QueryFields`, `ReadRequest`, `Endpoint`, `SubmitResponse`, `toHex`.
- **Core / identity:** `DelegationChain`, `DelegationIdentity`, `Ed25519KeyIdentity`, `Ed25519PublicKey`, `WebAuthnIdentity`, `Delegation`, `DER_COSE_OID`, `unwrapDER`.
- **Core / identity/secp256k1:** `Secp256k1KeyIdentity`.
- **Core / candid:** `IDL`, `PipeArrayBuffer`, `lebDecode`, `bufFromBufLike`.
- **Core / principal:** `Principal`.
- **Auth / client:** `AuthClient`, `IdleManager`, `IdleManagerOptions`, `IdbStorage`, `LocalStorage`, `scopedKeys`.
- **Canisters / nns:** `GovernanceCanister`, `Topic`, `NeuronState`, `NeuronVisibility`, `NeuronInfo`, `Neuron`, `Followees`, `NetworkEconomics`, `NeuronId`.
- **Canisters / sns:** `SnsNervousSystemParameters`, `SnsNeuronId`, `SnsWrapper` и т.д.
- **Canisters / ledger/icp:** `AccountIdentifier`, `Account`, `SubAccount`, `LedgerCanister`, `Icrc1BlockIndex`.
- **Canisters / ledger/icrc:** `IcrcLedgerCanister`, `IcrcIndexCanister`, `IcrcAccount`, `ApproveParams`, `decodeIcrcAccount`.
- **Canisters / ckbtc:** `CkBTCMinterCanister`, `BitcoinCanister`, `Utxo`, `RetrieveBtcOk`.

> ⚠️ Названия классов выше — на основе текущих использований в коде nfid-frontend. После установки `@icp-sdk/canisters@^3.6.0` нужно подтвердить точные сигнатуры (`GovernanceCanister.create({ agent, canisterId })`, `LedgerCanister.create({ agent })`). Маловероятно, но возможны переименования.

---

## 5. `@dfinity/utils` — заменяем локальным модулем

В `@icp-sdk` **нет прямой замены** этого пакета. Принятое решение: **вынести 5–6 утилит в `packages/utils/src/lib/dfinity-compat.ts`** и полностью удалить `@dfinity/utils` из зависимостей. Это держит транзитивную поверхность чистой и не оставляет «легаси-якоря» в `package.json`.

> Пакет `packages/utils` опубликован под именем `@nfid-frontend/validation` — импорты будут идти через него.

### 5.1. Маппинг утилит

| Утилита                                           | Где используется                                                                                                                              | Замена                                                                                         |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `createAgent({ identity, host, fetchRootKey })`   | `staking/governance.api.ts`, `staking/sns-wrapper.api.ts`, `staking/icp-ledger.api.ts`, `vault/index.ts`, `bitcoin/services/ckbtc.service.ts` | `HttpAgent.create({ identity, host, shouldFetchRootKey })` из `@icp-sdk/core/agent` (см. §5.3) |
| `nonNullish(x)`                                   | `staking-side-panel.tsx`, `manage-tokens.tsx`, `token-modal.tsx`, `staking/util/dev.utils.ts`                                                 | `nonNullish` из `@nfid-frontend/validation`                                                    |
| `toNullable(x)`                                   | `address-book-canister.client.ts`, `chain-fusion-signer.service.ts`                                                                           | `toNullable` из `@nfid-frontend/validation`                                                    |
| `hexStringToUint8Array` / `uint8ArrayToHexString` | `get-address.ts`, `util/get-address.ts`, `staking-details/index.tsx`                                                                          | `hexToBytes` / `bytesToHex` из `@noble/hashes/utils` (уже транзитивно через `@icp-sdk/core`)   |
| `nowInBigIntNanoSeconds()`                        | `staking/icp-ledger.api.ts`                                                                                                                   | `nowInBigIntNanoSeconds` из `@nfid-frontend/validation`                                        |
| `debounce`                                        | `use-vault-member.ts`                                                                                                                         | `debounce` из `lodash-es` (уже в проекте)                                                      |

### 5.2. Новый файл `packages/utils/src/lib/dfinity-compat.ts`

```ts
// packages/utils/src/lib/dfinity-compat.ts
// Локальные замены утилит из @dfinity/utils, не имеющих аналогов в @icp-sdk/*.

/**
 * Type-guard, эквивалентный @dfinity/utils#nonNullish.
 */
export const nonNullish = <T>(value: T): value is NonNullable<T> =>
  value !== null && value !== undefined

/**
 * Кандидовский Option-маппер: T | undefined → [] | [T].
 * Эквивалент @dfinity/utils#toNullable.
 */
export const toNullable = <T>(value: T | undefined): [] | [T] =>
  value === undefined ? [] : [value]

/**
 * Текущее время в наносекундах (BigInt), для полей Candid вида `nat64`/timestamps.
 * Эквивалент @dfinity/utils#nowInBigIntNanoSeconds.
 */
export const nowInBigIntNanoSeconds = (): bigint =>
  BigInt(Date.now()) * 1_000_000n
```

И регистрация в `packages/utils/src/index.ts`:

```diff
  export * from "./lib/trim-concat"
+ export * from "./lib/dfinity-compat"
```

### 5.3. Замена `createAgent` — пример

`@dfinity/utils#createAgent` — обёртка над `HttpAgent.create`, дополнительно зовущая `fetchRootKey()` в dev-режиме. Прямой замены нет; переписываем на нативный API.

**До:**

```ts
import { createAgent } from "@dfinity/utils"

const agent = await createAgent({
  identity,
  host: IC_HOST,
  fetchRootKey: ic.isLocal,
})
```

**После:**

```ts
import { HttpAgent } from "@icp-sdk/core/agent"

const agent = await HttpAgent.create({
  identity,
  host: IC_HOST,
  shouldFetchRootKey: ic.isLocal,
})
```

> Поведение идентично: флаг `shouldFetchRootKey` в `HttpAgent.create` внутренне зовёт `fetchRootKey()` ровно так же, как делал `createAgent`.

### 5.4. Codemod для импортов из `@nfid-frontend/validation`

После §3.2 (массовая замена `@dfinity/*` импортов) выполнить для оставшихся точечных замен `@dfinity/utils`:

```bash
# nonNullish, toNullable, nowInBigIntNanoSeconds → @nfid-frontend/validation
# (createAgent, hexStringToUint8Array, uint8ArrayToHexString, debounce — заменяем вручную)

find . -type f \( -name '*.ts' -o -name '*.tsx' \) \
  -not -path './node_modules/*' -not -path './dist/*' -not -path './build/*' \
  -exec perl -pi -e '
    s|(["\x27])@dfinity/utils\1|$1\@nfid-frontend/validation$1|g if /\b(nonNullish|toNullable|nowInBigIntNanoSeconds)\b/;
  ' {} +
```

> ⚠️ Регулярка простая и сработает только для строк, где в этой же строке встречается имя одной из трёх утилит. Файлы с `createAgent`/`hex*`/`debounce` нужно править вручную — их немного (см. таблицу §5.1), быстрее посмотреть глазами, чем строить хитрый AST-codemod.

### 5.5. Финальный шаг

После того как все 15 файлов перепрописаны, удалить пакет:

```bash
pnpm remove @dfinity/utils
grep -rln "from [\"']@dfinity/utils[\"']" apps packages   # должно быть пусто
```

### 5.6. Альтернатива (если решили не выносить)

Оставить `@dfinity/utils@^2.14.0` как единственный пакет старого дерева. Он не тащит за собой `Identity`/`Principal`, поэтому конфликта типов не будет. Минусы:

- В `package.json` остаётся «легаси-якорь», который никто потом не вычистит.
- Транзитивно подтягивается старый `@dfinity/principal` (в `peerDependencies` `@dfinity/utils`), что увеличивает bundle и плодит дубликаты типов в runtime.

**По умолчанию идём по основному пути (§5.1–5.5).** Альтернативу выбираем только если в команде есть явное возражение и оно зафиксировано в описании PR.

---

## 6. Полный inventory файлов

Ниже — все файлы, требующие правки, сгруппированные по пакету. После прогона codemod (§3.2) большинство будет изменено автоматически. Файлы, требующие **дополнительной ручной проверки** после автозамены, помечены **жирным**.

### 6.1. `@dfinity/agent` → `@icp-sdk/core/agent` (134)

<details>
<summary>Развернуть список</summary>

```
apps/nfid-demo/src/context/authentication.tsx
apps/nfid-demo/src/hooks/useAuthentication.ts
apps/nfid-frontend/src/features/authentication/auth-selection/ii-flow/ii-auth.service.ts
apps/nfid-frontend/src/features/identitykit/idl/consent.ts
apps/nfid-frontend/src/features/identitykit/idl/token-pepe-ledger_idl.ts
apps/nfid-frontend/src/features/identitykit/service/actor.service.ts
**apps/nfid-frontend/src/features/identitykit/service/call-canister.service.ts**  ← Certificate.create + v3ResponseBody
apps/nfid-frontend/src/features/identitykit/service/canister-calls-helpers/icrc1-transfer.ts
apps/nfid-frontend/src/features/identitykit/service/canister-calls-helpers/icrc2-approve.ts
apps/nfid-frontend/src/features/identitykit/service/canister-calls-helpers/ledger-transfer.ts
apps/nfid-frontend/src/features/identitykit/service/consent-message.service.ts
**apps/nfid-frontend/src/features/identitykit/service/interface-factory.service.ts**  ← Certificate.create
apps/nfid-frontend/src/features/identitykit/service/method/interactive/icrc49-call-canister-method.service.ts
apps/nfid-frontend/src/features/identitykit/service/target-validation/ext-target-validation.service.ts
apps/nfid-frontend/src/features/identitykit/service/target-validation/origins-target-validation.service.ts
apps/nfid-frontend/src/features/identitykit/service/target-validation/standards-target-validation.service.ts
apps/nfid-frontend/src/features/identitykit/service/target-validation/target-validation.service.ts
apps/nfid-frontend/src/features/identitykit/service/target.service.ts
apps/nfid-frontend/src/features/staking/utils.ts
apps/nfid-frontend/src/features/vaults/hooks/use-vault-member.ts
apps/nfid-frontend/src/hooks/identity.ts
apps/nfid-frontend/src/integration/_ic_api/identity_manager.d.ts
apps/nfid-frontend/src/integration/_ic_api/internet_identity.d.ts
apps/nfid-frontend/src/integration/_ic_api/verifier.d.ts
apps/nfid-frontend/src/integration/address-book/client/address-book-canister.client.ts
apps/nfid-frontend/src/integration/bitcoin/bitcoin.service.spec.ts
apps/nfid-frontend/src/integration/bitcoin/bitcoin.service.ts
apps/nfid-frontend/src/integration/bitcoin/idl/chain-fusion-signer.d.ts
apps/nfid-frontend/src/integration/bitcoin/services/chain-fusion-signer.service.ts
apps/nfid-frontend/src/integration/bitcoin/services/ckbtc.service.ts
apps/nfid-frontend/src/integration/bitcoin/services/patron.service.ts
apps/nfid-frontend/src/integration/device/create-device-factory.ts
apps/nfid-frontend/src/integration/ethereum/erc20-abstract.service.ts
apps/nfid-frontend/src/integration/ethereum/evm.service.ts
apps/nfid-frontend/src/integration/ft/ft-service.ts
apps/nfid-frontend/src/integration/ft/ft.ts
apps/nfid-frontend/src/integration/ft/impl/ft-btc-impl.ts
apps/nfid-frontend/src/integration/ft/impl/ft-erc20-abstract-impl.ts
apps/nfid-frontend/src/integration/ft/impl/ft-evm-abstract-impl.ts
apps/nfid-frontend/src/integration/ft/impl/ft-impl.ts
apps/nfid-frontend/src/integration/identity-manager/index.ts
apps/nfid-frontend/src/integration/identity/__mocks.ts
apps/nfid-frontend/src/integration/identity/delegation-chain-from-delegation.ts
apps/nfid-frontend/src/integration/identity/multiWebAuthnIdentity.ts
apps/nfid-frontend/src/integration/internet-identity/index.ts
apps/nfid-frontend/src/integration/internet-identity/utils.ts
apps/nfid-frontend/src/integration/lambda/symmetric/index.ts
apps/nfid-frontend/src/integration/lambda/util/util.ts
apps/nfid-frontend/src/integration/nft/impl/icpswap/nft-icpswap.ts
apps/nfid-frontend/src/integration/nft/impl/nft-abstract.ts
apps/nfid-frontend/src/integration/nft/impl/yumi/idl/yumiNft.d.ts
apps/nfid-frontend/src/integration/note/note-service.ts
apps/nfid-frontend/src/integration/rosetta/get-wallet-delegation.ts
apps/nfid-frontend/src/integration/signin/index.ts
apps/nfid-frontend/src/integration/staking/impl/nfid-icp-neuron-impl.ts
apps/nfid-frontend/src/integration/staking/impl/nfid-neuron-impl.ts
apps/nfid-frontend/src/integration/staking/impl/nfid-sns-neuron-impl.ts
apps/nfid-frontend/src/integration/staking/nfid-neuron.ts
apps/nfid-frontend/src/integration/staking/service/staking-service-impl.ts
apps/nfid-frontend/src/integration/staking/staking-service.ts
apps/nfid-frontend/src/integration/swap/errors/error-handler-abstract.ts
apps/nfid-frontend/src/integration/swap/errors/impl/abstract-error-handler.ts
apps/nfid-frontend/src/integration/swap/icpswap/error-handler/handler/icp-swap-withdraw-handler.ts
apps/nfid-frontend/src/integration/swap/icpswap/error-handler/shroff/deposit-shroff.ts
apps/nfid-frontend/src/integration/swap/icpswap/error-handler/shroff/nfid-shroff.ts
apps/nfid-frontend/src/integration/swap/icpswap/error-handler/shroff/swap-shroff.ts
apps/nfid-frontend/src/integration/swap/icpswap/error-handler/shroff/withdraw-shroff.ts
apps/nfid-frontend/src/integration/swap/icpswap/idl/SwapFactory.d.ts
apps/nfid-frontend/src/integration/swap/icpswap/idl/SwapPool.d.ts
apps/nfid-frontend/src/integration/swap/icpswap/impl/shroff-icp-swap-impl.ts
apps/nfid-frontend/src/integration/swap/icpswap/service/icpswap-service.ts
apps/nfid-frontend/src/integration/swap/kong/error-handler/error-shroff/kong-nfid-error-handler.ts
apps/nfid-frontend/src/integration/swap/kong/error-handler/error-shroff/kongswap-swap-handler.ts
apps/nfid-frontend/src/integration/swap/kong/idl/icrc1.d.ts
apps/nfid-frontend/src/integration/swap/kong/idl/kong_backend.d.ts
apps/nfid-frontend/src/integration/swap/kong/impl/kong-swap-shroff.ts
apps/nfid-frontend/src/integration/swap/shroff.ts
apps/nfid-frontend/src/integration/swap/shroff/shroff-abstract.ts
apps/nfid-frontend/src/integration/swap/transaction/transaction-error-handler.ts
apps/nfid-frontend/src/integration/swap/transaction/transaction-service.ts
apps/nfid-frontend/src/integration/test-util.ts
apps/nfid-frontend/src/integration/walletconnect/walletconnect.service.ts
apps/nfid-frontend/src/integration/webauthn/creation-options.ts
apps/nfid-frontend/src/state/authentication.ts
packages/integration/src/lib/_ic_api/delegation_factory.d.ts
packages/integration/src/lib/_ic_api/ecdsa-signer.d.ts
packages/integration/src/lib/_ic_api/icrc1.d.ts
packages/integration/src/lib/_ic_api/icrc1_oracle.d.ts
packages/integration/src/lib/_ic_api/identity_manager.d.ts
packages/integration/src/lib/_ic_api/index-icrc1.d.ts
packages/integration/src/lib/_ic_api/internet_identity.d.ts
packages/integration/src/lib/_ic_api/ledger-index-icrc1.d.ts
packages/integration/src/lib/_ic_api/passkey_storage.d.ts
packages/integration/src/lib/_ic_api/swap_trs_storage.d.ts
packages/integration/src/lib/_ic_api/user_registry.d.ts
packages/integration/src/lib/_ic_api/vault.d.ts
packages/integration/src/lib/_ic_api/verifier.d.ts
packages/integration/src/lib/actors.ts
packages/integration/src/lib/agent/index.ts
packages/integration/src/lib/authentication/auth-state.ts
packages/integration/src/lib/authentication/frontend-delegation.ts
packages/integration/src/lib/delegation-factory/delegation-df.spec.ts
packages/integration/src/lib/delegation-factory/delegation-factory.ts
packages/integration/src/lib/exchange/exchange-rate.ts
packages/integration/src/lib/exchange/idl/ExchangeRate.d.ts
packages/integration/src/lib/exchange/idl/NodeIndex.d.ts
packages/integration/src/lib/exchange/idl/Token.d.ts
packages/integration/src/lib/internet-identity/delegation-identity-from-signed-identity.ts
packages/integration/src/lib/internet-identity/get-delegate.spec.ts
packages/integration/src/lib/internet-identity/get-delegate.ts
packages/integration/src/lib/internet-identity/get-delegation-chain.ts
**packages/integration/src/lib/lambda/cert-verification/index.ts**  ← Certificate.create
packages/integration/src/lib/lambda/cert-verification/utils.ts
packages/integration/src/lib/lambda/ecdsa.spec.ts
packages/integration/src/lib/lambda/passkey.ts
packages/integration/src/lib/lambda/targets.spec.ts
packages/integration/src/lib/lambda/targets.ts
packages/integration/src/lib/lambda/util.ts
packages/integration/src/lib/staking/governance.api.ts
packages/integration/src/lib/staking/icp-ledger.api.ts
packages/integration/src/lib/staking/sns-governance.api.ts
packages/integration/src/lib/staking/sns-wrapper.api.ts
packages/integration/src/lib/token/icp/transfer.ts
packages/integration/src/lib/token/icrc1/icrc1-pair/i-icrc-pair.ts
packages/integration/src/lib/token/icrc1/icrc1-pair/impl/Icrc1-pair.ts
packages/integration/src/lib/token/icrc1/index.ts
packages/integration/src/lib/token/icrc1/service/icrc1-oracle-service.ts
packages/integration/src/lib/token/icrc1/service/icrc1-transaction-history-service.ts
packages/ui/src/organisms/activity/components/activity-table-group.tsx
packages/ui/src/organisms/activity/components/activity-table-row.tsx
packages/ui/src/organisms/activity/index.tsx
packages/ui/src/organisms/permissions/index.tsx
packages/ui/src/organisms/staking/components/staking-side-panel.tsx
packages/ui/src/organisms/staking/staking-details.tsx
```

</details>

### 6.2. `@dfinity/candid` → `@icp-sdk/core/candid` (21)

<details>
<summary>Развернуть список</summary>

```
apps/nfid-frontend/src/features/identitykit/idl/consent.ts
apps/nfid-frontend/src/features/identitykit/idl/token-pepe-ledger_idl.ts
apps/nfid-frontend/src/features/identitykit/service/call-canister.service.ts
apps/nfid-frontend/src/features/identitykit/service/interface-factory.service.ts
apps/nfid-frontend/src/features/identitykit/service/method/interactive/icrc49-call-canister-method.service.ts
apps/nfid-frontend/src/integration/bitcoin/idl/chain-fusion-signer.d.ts
apps/nfid-frontend/src/integration/lambda/symmetric/index.ts
apps/nfid-frontend/src/integration/swap/icpswap/idl/SwapPool.d.ts
apps/nfid-frontend/src/integration/swap/kong/idl/kong_backend.d.ts
packages/integration/src/lib/_ic_api/delegation_factory.d.ts
packages/integration/src/lib/_ic_api/icrc1_oracle.d.ts
packages/integration/src/lib/_ic_api/index-icrc1.d.ts
packages/integration/src/lib/_ic_api/passkey_storage.d.ts
packages/integration/src/lib/_ic_api/swap_trs_storage.d.ts
packages/integration/src/lib/_ic_api/user_registry.d.ts
packages/integration/src/lib/delegation-factory/delegation-df.spec.ts
packages/integration/src/lib/lambda/cert-verification/index.ts
packages/integration/src/lib/lambda/ecdsa.spec.ts
packages/integration/src/lib/lambda/execute-canister-call.spec.ts
packages/integration/src/lib/lambda/targets.spec.ts
packages/integration/src/lib/lambda/targets.ts
```

</details>

### 6.3. `@dfinity/principal` → `@icp-sdk/core/principal` (142)

<details>
<summary>Развернуть список</summary>

```
apps/nfid-demo/src/context/authentication.tsx
apps/nfid-frontend/src/apps/authentication/use-authentication.ts
apps/nfid-frontend/src/apps/identity-manager/request-transfer/index.tsx
apps/nfid-frontend/src/contexts/btc-address.tsx
apps/nfid-frontend/src/features/authentication/3rd-party/choose-account/services.ts
apps/nfid-frontend/src/features/collectibles/utils/util.ts
apps/nfid-frontend/src/features/fungible-token/fetch-balances.ts
apps/nfid-frontend/src/features/fungible-token/utils.ts
apps/nfid-frontend/src/features/identitykit/helpers/validate-derivation-origin.ts
apps/nfid-frontend/src/features/identitykit/idl/token-pepe-ledger_idl.ts
apps/nfid-frontend/src/features/identitykit/service/account.service.ts
apps/nfid-frontend/src/features/identitykit/service/call-canister.service.ts
apps/nfid-frontend/src/features/identitykit/service/interface-factory.service.ts
apps/nfid-frontend/src/features/permissions/index.tsx
apps/nfid-frontend/src/features/sdk/request-canister-call/index.tsx
apps/nfid-frontend/src/features/security/device-connector.ts
apps/nfid-frontend/src/features/security/utils.ts
apps/nfid-frontend/src/features/staking/utils.ts
apps/nfid-frontend/src/features/transfer-modal/components/receive.tsx
apps/nfid-frontend/src/features/transfer-modal/components/send-ft.tsx
apps/nfid-frontend/src/features/transfer-modal/utils.ts
apps/nfid-frontend/src/features/vaults/utils.ts
apps/nfid-frontend/src/features/vaults/vaults-details/transactions-page/table/index.tsx
apps/nfid-frontend/src/hooks/btc-to-ckbtc.ts
apps/nfid-frontend/src/integration/_ic_api/ext.d.ts
apps/nfid-frontend/src/integration/_ic_api/identity_manager.d.ts
apps/nfid-frontend/src/integration/_ic_api/im_addition.d.ts
apps/nfid-frontend/src/integration/_ic_api/internet_identity.d.ts
apps/nfid-frontend/src/integration/_ic_api/ledger.d.ts
apps/nfid-frontend/src/integration/_ic_api/pub_sub_channel.d.ts
apps/nfid-frontend/src/integration/_ic_api/verifier.d.ts
apps/nfid-frontend/src/integration/address-book/client/address-book-canister.client.ts
apps/nfid-frontend/src/integration/bitcoin/idl/chain-fusion-signer.d.ts
apps/nfid-frontend/src/integration/bitcoin/services/bitcoin-canister.service.ts
apps/nfid-frontend/src/integration/bitcoin/services/ckbtc.service.ts
apps/nfid-frontend/src/integration/bitcoin/services/patron.service.ts
apps/nfid-frontend/src/integration/entrepot/ext.ts
apps/nfid-frontend/src/integration/entrepot/index.spec.ts
apps/nfid-frontend/src/integration/entrepot/index.ts
apps/nfid-frontend/src/integration/entrepot/lib.ts
apps/nfid-frontend/src/integration/entrepot/mapper.ts
apps/nfid-frontend/src/integration/entrepot/types.ts
apps/nfid-frontend/src/integration/ethereum/evm.service.ts
apps/nfid-frontend/src/integration/facade/index.spec.ts
apps/nfid-frontend/src/integration/facade/index.ts
apps/nfid-frontend/src/integration/facade/wallet.spec.ts
apps/nfid-frontend/src/integration/facade/wallet.ts
apps/nfid-frontend/src/integration/ft/ft-service.ts
apps/nfid-frontend/src/integration/ft/ft.ts
apps/nfid-frontend/src/integration/ft/impl/ft-btc-impl.ts
apps/nfid-frontend/src/integration/ft/impl/ft-erc20-abstract-impl.ts
apps/nfid-frontend/src/integration/ft/impl/ft-evm-abstract-impl.ts
apps/nfid-frontend/src/integration/ft/impl/ft-impl.ts
apps/nfid-frontend/src/integration/ft/test/ft.spec.ts
apps/nfid-frontend/src/integration/identity-manager/__mocks.ts
apps/nfid-frontend/src/integration/identity-manager/devices/hooks.ts
apps/nfid-frontend/src/integration/identity-manager/index.ts
apps/nfid-frontend/src/integration/internet-identity/validateDerivationOrigin.ts
apps/nfid-frontend/src/integration/lambda/util/util.ts
apps/nfid-frontend/src/integration/nft/geek/geek-types.spec.ts
apps/nfid-frontend/src/integration/nft/geek/nft-geek-service.ts
apps/nfid-frontend/src/integration/nft/impl/ext/test/ext.spec.ts
apps/nfid-frontend/src/integration/nft/impl/icpswap/idl/SwapNFT.d.ts
apps/nfid-frontend/src/integration/nft/impl/nft-abstract.ts
apps/nfid-frontend/src/integration/nft/impl/yumi/idl/yumiNft.d.ts
apps/nfid-frontend/src/integration/nft/impl/yumi/test/yumi.spec.ts
apps/nfid-frontend/src/integration/nft/nft-service.ts
apps/nfid-frontend/src/integration/nft/test/nft.spec.ts
apps/nfid-frontend/src/integration/portfolio-balance/portfolio-service.ts
apps/nfid-frontend/src/integration/rosetta/get-wallet-principal.ts
apps/nfid-frontend/src/integration/staking/impl/nfid-sns-neuron-impl.ts
apps/nfid-frontend/src/integration/staking/service/staking-service-impl.ts
apps/nfid-frontend/src/integration/staking/test/staking.spec.ts
apps/nfid-frontend/src/integration/swap/icpswap/idl/SwapFactory.d.ts
apps/nfid-frontend/src/integration/swap/icpswap/idl/SwapPool.d.ts
apps/nfid-frontend/src/integration/swap/icpswap/impl/shroff-icp-swap-impl.ts
apps/nfid-frontend/src/integration/swap/icpswap/service/icpswap-service.ts
apps/nfid-frontend/src/integration/swap/kong/idl/icrc1.d.ts
apps/nfid-frontend/src/integration/swap/kong/idl/kong_backend.d.ts
apps/nfid-frontend/src/integration/swap/kong/impl/kong-swap-shroff.ts
apps/nfid-frontend/src/integration/swap/shroff/shroff-abstract.ts
apps/nfid-frontend/src/integration/wallet/hooks/use-all-wallets.ts
apps/nfid-frontend/src/types/nft.ts
apps/nfid-frontend/src/util/fetch-btc-address.ts
apps/nfid-frontend/src/util/get-address.ts
packages/integration/src/lib/_ic_api/delegation_factory.d.ts
packages/integration/src/lib/_ic_api/ecdsa-signer.d.ts
packages/integration/src/lib/_ic_api/ext.d.ts
packages/integration/src/lib/_ic_api/icrc1.d.ts
packages/integration/src/lib/_ic_api/icrc1_oracle.d.ts
packages/integration/src/lib/_ic_api/identity_manager.d.ts
packages/integration/src/lib/_ic_api/im_addition.d.ts
packages/integration/src/lib/_ic_api/index-icrc1.d.ts
packages/integration/src/lib/_ic_api/internet_identity.d.ts
packages/integration/src/lib/_ic_api/ledger-index-icrc1.d.ts
packages/integration/src/lib/_ic_api/ledger.d.ts
packages/integration/src/lib/_ic_api/passkey_storage.d.ts
packages/integration/src/lib/_ic_api/pub_sub_channel.d.ts
packages/integration/src/lib/_ic_api/swap_trs_storage.d.ts
packages/integration/src/lib/_ic_api/vault.d.ts
packages/integration/src/lib/_ic_api/verifier.d.ts
packages/integration/src/lib/actors.ts
packages/integration/src/lib/agent/index.ts
packages/integration/src/lib/delegation-factory/delegation-df.spec.ts
packages/integration/src/lib/delegation-factory/delegation-factory.ts
packages/integration/src/lib/delegation-factory/types.ts
packages/integration/src/lib/exchange/idl/ExchangeRate.d.ts
packages/integration/src/lib/exchange/idl/NodeIndex.d.ts
packages/integration/src/lib/exchange/idl/Token.d.ts
packages/integration/src/lib/internet-identity/fetch-principals.ts
packages/integration/src/lib/internet-identity/types.ts
packages/integration/src/lib/lambda/cert-verification/index.ts
packages/integration/src/lib/lambda/lambda-delegation.ts
packages/integration/src/lib/lambda/targets.ts
packages/integration/src/lib/lambda/util.ts
packages/integration/src/lib/rosetta/balance/index.spec.ts
packages/integration/src/lib/staking/governance.api.ts
packages/integration/src/lib/staking/icp-ledger.api.ts
packages/integration/src/lib/staking/sns-governance.api.ts
packages/integration/src/lib/staking/sns-wrapper.api.ts
packages/integration/src/lib/staking/test/staking.spec.ts
packages/integration/src/lib/token/btc/service/btc-deposit-service.test.ts
packages/integration/src/lib/token/btc/service/btc-deposit-service.ts
packages/integration/src/lib/token/icp/transfer.ts
packages/integration/src/lib/token/icrc1/icrc1-pair/i-icrc-pair.ts
packages/integration/src/lib/token/icrc1/icrc1-pair/impl/Icrc1-pair.ts
packages/integration/src/lib/token/icrc1/icrc1-pair/impl/icrc1-pair.spec.ts
packages/integration/src/lib/token/icrc1/index.spec.ts
packages/integration/src/lib/token/icrc1/service/icrc1-transaction-history-service.ts
packages/integration/src/lib/token/icrc1/test/icrc1-pair/icrc1-pair.spec.ts
packages/integration/src/lib/token/icrc1/test/icrc1-service.spec.ts
packages/integration/src/lib/token/icrc1/types.ts
packages/integration/src/lib/vault/index.ts
packages/ui/src/molecules/choose-modal/token-modal.tsx
packages/ui/src/organisms/app-acc-balance-sheet/index.tsx
packages/ui/src/organisms/header/navigation-popup/view-only-modal.tsx
packages/ui/src/organisms/send-receive/components/send-ft.stories.tsx
packages/ui/src/organisms/send-receive/components/swap.stories.tsx
packages/ui/src/organisms/send-receive/hooks/token-init.tsx
packages/ui/src/organisms/tokens/components/filtered-asset.tsx
packages/ui/src/pages/auth-wrapper/index.tsx
packages/ui/src/templates/profile-template/Template.tsx
```

</details>

### 6.4. `@dfinity/identity` → `@icp-sdk/core/identity` (100)

<details>
<summary>Развернуть список</summary>

```
apps/nfid-demo/src/context/authentication.tsx
apps/nfid-demo/src/hooks/useAuthentication.ts
apps/nfid-demo/src/pages/new/examples/updated-delegation/index.tsx
apps/nfid-frontend/src/apps/authentication/use-authentication.ts
apps/nfid-frontend/src/features/authentication/auth-selection/email-flow/machine.ts
apps/nfid-frontend/src/features/authentication/auth-selection/email-flow/services.ts
apps/nfid-frontend/src/features/authentication/auth-selection/google-flow/services.ts
apps/nfid-frontend/src/features/authentication/auth-selection/ii-flow/ii-auth.service.ts
apps/nfid-frontend/src/features/authentication/auth-selection/other-sign-options/services.ts
apps/nfid-frontend/src/features/authentication/auth-selection/passkey-flow/service.spec.ts
apps/nfid-frontend/src/features/authentication/auth-selection/passkey-flow/services.ts
apps/nfid-frontend/src/features/embed/services/check-auth-state.ts
apps/nfid-frontend/src/features/identitykit/service/authentication.service.ts
apps/nfid-frontend/src/features/identitykit/service/call-canister.service.ts
apps/nfid-frontend/src/features/identitykit/service/method/interactive/icrc34-delegation-method.service.ts
apps/nfid-frontend/src/features/identitykit/service/method/interactive/icrc49-call-canister-method.service.ts
apps/nfid-frontend/src/features/iframe/iframe-trust-device/coordinator.tsx
apps/nfid-frontend/src/features/iframe/iframe-trust-device/services.ts
apps/nfid-frontend/src/features/sdk/ui/footer/index.tsx
apps/nfid-frontend/src/features/security/sync-device-ii-service.ts
apps/nfid-frontend/src/features/transfer-modal/utils.ts
apps/nfid-frontend/src/integration/adapters/delegations.ts
apps/nfid-frontend/src/integration/address-book/address-book.facade.spec.ts
apps/nfid-frontend/src/integration/device/services.ts
apps/nfid-frontend/src/integration/e2e-helper/updateUsersE2Edelegations.ts
apps/nfid-frontend/src/integration/entrepot/ext.spec.ts
apps/nfid-frontend/src/integration/ethereum/eth/ethereum.spec.ts
apps/nfid-frontend/src/integration/facade/index.spec.ts
apps/nfid-frontend/src/integration/facade/wallet.spec.ts
apps/nfid-frontend/src/integration/facade/wallet.ts
apps/nfid-frontend/src/integration/identity-manager/devices/hooks.ts
apps/nfid-frontend/src/integration/identity-manager/index.ts
apps/nfid-frontend/src/integration/identity/__mocks.ts
apps/nfid-frontend/src/integration/identity/delegation-chain-from-delegation.ts
apps/nfid-frontend/src/integration/identity/index.ts
apps/nfid-frontend/src/integration/identity/multiWebAuthnIdentity.ts
apps/nfid-frontend/src/integration/internet-identity/api-result-to-login-result.ts
apps/nfid-frontend/src/integration/internet-identity/crypto/ed25519.ts
apps/nfid-frontend/src/integration/internet-identity/index.spec.ts
apps/nfid-frontend/src/integration/internet-identity/index.ts
apps/nfid-frontend/src/integration/internet-identity/services.mocks.ts
apps/nfid-frontend/src/integration/internet-identity/services.ts
apps/nfid-frontend/src/integration/lambda/google/index.ts
apps/nfid-frontend/src/integration/lambda/symmetric/index.spec.ts
apps/nfid-frontend/src/integration/lambda/symmetric/index.ts
apps/nfid-frontend/src/integration/lambda/util/util.ts
apps/nfid-frontend/src/integration/pubsub/index.ts
apps/nfid-frontend/src/integration/rosetta/get-wallet-delegation.ts
apps/nfid-frontend/src/integration/sign-in/internet-identity.ts
apps/nfid-frontend/src/integration/signin/index.spec.ts
apps/nfid-frontend/src/integration/signin/index.ts
apps/nfid-frontend/src/integration/staking/test/staking.spec.ts
apps/nfid-frontend/src/integration/swap/icpswap/error-handler/test/error-deposit-handler.spec.ts
apps/nfid-frontend/src/integration/swap/icpswap/error-handler/test/error-swap-handler.spec.ts
apps/nfid-frontend/src/integration/swap/icpswap/error-handler/test/error-transfer-nfid-handler.spec.ts
apps/nfid-frontend/src/integration/swap/icpswap/error-handler/test/error-transfer-swap-handler.spec.ts
apps/nfid-frontend/src/integration/swap/icpswap/error-handler/test/error-withdraw-handler.spec.ts
apps/nfid-frontend/src/integration/swap/icpswap/impl/test/shroff.spec.ts
apps/nfid-frontend/src/integration/swap/kong/error-handler/test/error-swap-kong.spec.ts
apps/nfid-frontend/src/integration/swap/kong/error-handler/test/error-transfer-kong.spec.ts
apps/nfid-frontend/src/integration/swap/kong/error-handler/test/error-transfer-nfid-kong.spec.ts
apps/nfid-frontend/src/integration/swap/kong/impl/test/shroff.spec.ts
apps/nfid-frontend/src/integration/swap/transaction/test/transaction-service.spec.ts
apps/nfid-frontend/src/integration/test-util.ts
apps/nfid-frontend/src/integration/wallet/hooks/use-transfer.ts
apps/nfid-frontend/src/state/authentication.ts
packages/integration/src/lib/agent/is-delegation-expired.ts
packages/integration/src/lib/asset/asset.ts
packages/integration/src/lib/asset/types.d.ts
packages/integration/src/lib/authentication/auth-state.ts
packages/integration/src/lib/authentication/delegation-state.ts
packages/integration/src/lib/authentication/frontend-delegation.ts
packages/integration/src/lib/authentication/get-expiration.ts
packages/integration/src/lib/authentication/user-id-data.ts
packages/integration/src/lib/authentication/utils.ts
packages/integration/src/lib/delegation-factory/delegation-df.spec.ts
packages/integration/src/lib/delegation-factory/delegation-factory.spec.ts
packages/integration/src/lib/delegation-factory/delegation-factory.ts
packages/integration/src/lib/delegation-factory/delegation-i.ts
packages/integration/src/lib/google-signin/google-signin-v2.service.ts
packages/integration/src/lib/internet-identity/delegation-identity-from-signed-identity.ts
packages/integration/src/lib/internet-identity/get-delegate.spec.ts
packages/integration/src/lib/internet-identity/get-delegate.ts
packages/integration/src/lib/internet-identity/get-delegation-by-scope.ts
packages/integration/src/lib/internet-identity/get-delegation-chain.ts
packages/integration/src/lib/lambda/ecdsa.spec.ts
packages/integration/src/lib/lambda/execute-canister-call.spec.ts
packages/integration/src/lib/lambda/execute-canister-call.ts
packages/integration/src/lib/lambda/lambda-delegation.ts
packages/integration/src/lib/lambda/passkey.spec.ts
packages/integration/src/lib/lambda/passkey.ts
packages/integration/src/lib/lambda/util.ts
packages/integration/src/lib/staking/test/staking.spec.ts
packages/integration/src/lib/test-utils.ts
packages/integration/src/lib/token/icrc1/icrc1-pair/impl/icrc1-pair.spec.ts
packages/integration/src/lib/token/icrc1/index.spec.ts
packages/integration/src/lib/token/icrc1/test/icrc1-pair/icrc1-pair.spec.ts
packages/integration/src/lib/token/icrc1/test/oracle-service.spec.ts
packages/integration/src/lib/token/icrc1/test/registry-service.spec.ts
packages/integration/src/lib/verification-email/verification.service.ts
```

</details>

### 6.5. `@dfinity/identity-secp256k1` → `@icp-sdk/core/identity/secp256k1` (2)

```
apps/nfid-frontend/src/integration/test-util.ts
packages/integration/src/lib/lambda/util.ts
```

### 6.6. `@dfinity/auth-client` → `@icp-sdk/auth/client` (4)

```
apps/nfid-demo/src/hooks/useAuthentication.ts
apps/nfid-frontend/src/features/authentication/auth-selection/ii-flow/ii-auth.service.ts
apps/nfid-frontend/src/integration/sign-in/internet-identity.ts
packages/integration/src/lib/authentication/session-handling.ts
```

### 6.7. `@dfinity/nns` → `@icp-sdk/canisters/nns` (11)

```
apps/nfid-frontend/src/features/staking/utils.ts
apps/nfid-frontend/src/integration/staking/calculator/stake-icp-params-calculator-impl.ts
apps/nfid-frontend/src/integration/staking/impl/nfid-icp-neuron-impl.ts
apps/nfid-frontend/src/integration/staking/impl/nfid-neuron-impl.ts
apps/nfid-frontend/src/integration/staking/impl/nfid-sns-neuron-impl.ts
apps/nfid-frontend/src/integration/staking/impl/staked-token-impl.ts
apps/nfid-frontend/src/integration/staking/nfid-neuron.ts
apps/nfid-frontend/src/integration/staking/service/staking-service-impl.ts
apps/nfid-frontend/src/integration/staking/types/index.ts
packages/integration/src/lib/staking/governance.api.ts
packages/ui/src/organisms/staking/components/staking-side-panel.tsx
```

### 6.8. `@dfinity/sns` → `@icp-sdk/canisters/sns` (4)

```
apps/nfid-frontend/src/integration/staking/calculator/stake-sns-params-calculator.ts
apps/nfid-frontend/src/integration/staking/service/staking-service-impl.ts
packages/integration/src/lib/staking/sns-governance.api.ts
packages/integration/src/lib/staking/sns-wrapper.api.ts
```

### 6.9. `@dfinity/ledger-icp` → `@icp-sdk/canisters/ledger/icp` (31)

<details>
<summary>Развернуть список</summary>

```
apps/nfid-demo/src/context/authentication.tsx
apps/nfid-frontend/src/apps/identity-manager/request-transfer/index.tsx
apps/nfid-frontend/src/features/authentication/3rd-party/choose-account/services.ts
apps/nfid-frontend/src/features/fungible-token/fetch-balances.ts
apps/nfid-frontend/src/features/identitykit/service/account.service.ts
apps/nfid-frontend/src/features/identitykit/service/canister-calls-helpers/default.ts
apps/nfid-frontend/src/features/identitykit/service/canister-calls-helpers/ledger-transfer.ts
apps/nfid-frontend/src/features/sdk/request-canister-call/index.tsx
apps/nfid-frontend/src/features/sdk/request-transfer/index.tsx
apps/nfid-frontend/src/features/sdk/ui/transfer-success.tsx/index.tsx
apps/nfid-frontend/src/features/transfer-modal/components/receive.tsx
apps/nfid-frontend/src/features/transfer-modal/components/send-ft.tsx
apps/nfid-frontend/src/features/transfer-modal/types/index.ts
apps/nfid-frontend/src/features/transfer-modal/utils.ts
apps/nfid-frontend/src/integration/entrepot/ext.spec.ts
apps/nfid-frontend/src/integration/entrepot/ext.ts
apps/nfid-frontend/src/integration/entrepot/lib.ts
apps/nfid-frontend/src/integration/ethereum/evm.service.ts
apps/nfid-frontend/src/integration/staking/impl/nfid-icp-neuron-impl.ts
apps/nfid-frontend/src/integration/swap/icpswap/impl/shroff-icp-swap-impl.ts
apps/nfid-frontend/src/integration/wallet/hooks/use-all-wallets.ts
apps/nfid-frontend/src/util/get-address.ts
packages/integration/src/lib/rosetta/balance/index.spec.ts
packages/integration/src/lib/rosetta/balance/index.ts
packages/integration/src/lib/staking/icp-ledger.api.ts
packages/integration/src/lib/token/icp/transfer.ts
packages/integration/src/lib/token/icrc1/icrc1-pair/impl/Icrc1-pair.ts
packages/integration/src/lib/token/icrc1/icrc1-pair/impl/icrc1-pair.spec.ts
packages/integration/src/lib/token/icrc1/service/icrc1-transaction-history-service.ts
packages/integration/src/lib/vault/index.ts
packages/ui/src/organisms/app-acc-balance-sheet/index.tsx
```

</details>

### 6.10. `@dfinity/ledger-icrc` → `@icp-sdk/canisters/ledger/icrc` (11)

```
apps/nfid-frontend/src/features/identitykit/service/canister-calls-helpers/default.ts
apps/nfid-frontend/src/features/identitykit/service/canister-calls-helpers/icrc1-transfer.ts
apps/nfid-frontend/src/features/identitykit/service/canister-calls-helpers/icrc2-approve.ts
apps/nfid-frontend/src/features/identitykit/service/canister-calls-helpers/ledger-transfer.ts
apps/nfid-frontend/src/features/transfer-modal/components/send-ft.tsx
apps/nfid-frontend/src/features/transfer-modal/utils.ts
apps/nfid-frontend/src/integration/bitcoin/services/ckbtc.service.ts
apps/nfid-frontend/src/integration/ethereum/evm.service.ts
packages/integration/src/lib/staking/sns-governance.api.ts
packages/integration/src/lib/staking/sns-wrapper.api.ts
packages/integration/src/lib/token/icp/transfer.ts
```

### 6.11. `@dfinity/ckbtc` → `@icp-sdk/canisters/ckbtc` (5)

```
apps/nfid-frontend/src/integration/bitcoin/services/bitcoin-canister.service.ts
apps/nfid-frontend/src/integration/bitcoin/services/ckbtc.service.ts
apps/nfid-frontend/src/integration/ft/utils.ts
packages/integration/src/lib/token/btc/service/btc-deposit-service.test.ts
packages/integration/src/lib/token/btc/service/btc-deposit-service.ts
```

### 6.12. `@dfinity/cketh` → `@icp-sdk/canisters/cketh` (1)

```
apps/nfid-frontend/src/integration/ethereum/evm.service.ts
```

### 6.13. `@dfinity/utils` — требует ручной разборки (см. §5) (15)

```
apps/nfid-frontend/src/features/staking-details/index.tsx
apps/nfid-frontend/src/features/vaults/hooks/use-vault-member.ts
apps/nfid-frontend/src/integration/address-book/client/address-book-canister.client.ts
apps/nfid-frontend/src/integration/bitcoin/services/chain-fusion-signer.service.ts
apps/nfid-frontend/src/integration/bitcoin/services/ckbtc.service.ts
apps/nfid-frontend/src/integration/staking/service/staking-service-impl.ts
apps/nfid-frontend/src/util/get-address.ts
packages/integration/src/lib/staking/governance.api.ts
packages/integration/src/lib/staking/icp-ledger.api.ts
packages/integration/src/lib/staking/sns-wrapper.api.ts
packages/integration/src/lib/staking/util/dev.utils.ts
packages/integration/src/lib/vault/index.ts
packages/ui/src/molecules/choose-modal/token-modal.tsx
packages/ui/src/organisms/staking/components/staking-side-panel.tsx
packages/ui/src/organisms/tokens/components/manage-tokens.tsx
```

---

## 7. Особенности и подводные камни

### 7.1. Codegen `_ic_api/*.d.ts`

В `packages/integration/src/lib/_ic_api/` и `apps/nfid-frontend/src/integration/_ic_api/` лежат **сгенерированные** `.d.ts` файлы (всего ~17). Они импортируют `ActorMethod` из `@dfinity/agent` и `Principal` из `@dfinity/principal`. Codemod их перепишет, но при следующем перегенерировании из `.did` файлов нужно убедиться, что генератор (`@icp-sdk/bindgen` или `didc`) выдаёт уже новые импорты — иначе ручные правки перетрутся.

**Действие:** найти место запуска codegen (вероятно в `package.json` scripts или Nx targets) и обновить шаблон/команду.

### 7.2. Storybook и моки

В списке файлов есть `.stories.tsx` и `__mocks.ts`. После миграции прогнать `pnpm storybook` для UI-пакета и проверить, что Principal-моки в `__mocks.ts` не сломались.

### 7.3. Тесты с делегациями

Большинство `*.spec.ts` в `packages/integration/src/lib/internet-identity/`, `delegation-factory/`, `lambda/` напрямую зависят от типов `DelegationChain`/`DelegationIdentity`. Если SDK сменил внутренние поля (`pubkey`, `signature` форматы) — это поймается тайпчеком, но на всякий случай прогнать unit-тесты пакета `integration` отдельно: `pnpm nx test integration`.

### 7.4. `@icp-sdk/auth` peer dependencies

`@icp-sdk/auth` зависит от `@icp-sdk/signer` и `idb`. `idb` уже может быть в lock-файле через `@dfinity/auth-client`; проверить, что версия совместима.

### 7.5. ESM / `"type": "module"`

В корневом `package.json` указано `"type": "module"`. Все `@icp-sdk/*` экспортируют и ESM, и CJS (`./index.js` + `./index.mjs`). Конфликтов быть не должно, но если в `tsconfig` стоит `moduleResolution: "node"`, лучше переключить на `"bundler"` или `"node16"` — submodule-пути типа `@icp-sdk/core/agent` корректно резолвятся только современными резолверами.

### 7.6. Локальное окружение

Перед мерджем убедиться, что:

- `dfx --version` ≥ 0.30.1
- В CI / GitHub Actions версия dfx тоже обновлена

---

## 8. Чеклист PR

- [ ] Старые `@dfinity/*` зависимости удалены из корневого `package.json`
- [ ] Новые `@icp-sdk/*` добавлены в `package.json`
- [ ] `pnpm install` прошёл без ошибок и warning'ов о peer deps
- [ ] Codemod (§3.2) выполнен; grep не находит старых импортов в `apps/` и `packages/`
- [ ] 3 точечные правки API (§4.1) применены вручную
- [ ] `@dfinity/utils` удалён, его 6 утилит заменены через `@nfid-frontend/validation` + `@noble/hashes/utils` + `lodash-es` (§5)
- [ ] В `packages/utils/src/lib/dfinity-compat.ts` добавлены `nonNullish`, `toNullable`, `nowInBigIntNanoSeconds` и реэкспортированы из `index.ts`
- [ ] Codegen-шаблон обновлён (§7.1)
- [ ] `pnpm typecheck` зелёный
- [ ] `pnpm test` зелёный
- [ ] `pnpm lint` зелёный (включая обновлённый `no-restricted-imports`)
- [ ] `pnpm build` зелёный (все workspaces)
- [ ] Smoke-тест: запуск `nfid-frontend` локально, прохождение auth flow через II
- [ ] Smoke-тест: стейкинг ICP/SNS — отображение нейронов
- [ ] Smoke-тест: ckBTC ввод/вывод
- [ ] Smoke-тест: ICRC-1 transfer
- [ ] Storybook собирается без ошибок
- [ ] E2E прогнан (`nfid-frontend-e2e-new`)
- [ ] dfx ≥ 0.30.1 в CI

---

## 9. Откат

Поскольку миграция big-bang в один PR, откат тривиален: `git revert <merge-commit>`. Никаких миграций данных или схем в этом изменении нет — только пакеты и импорты.

---

## 10. Ссылки

- Главная экосистемы: <https://js.icp.build>
- Миграция core: <https://js.icp.build/core/latest/upgrading/v5>
- Миграция auth: <https://js.icp.build/auth/latest/upgrading/v4>
- npm: [`@icp-sdk/core`](https://www.npmjs.com/package/@icp-sdk/core), [`@icp-sdk/auth`](https://www.npmjs.com/package/@icp-sdk/auth), [`@icp-sdk/canisters`](https://www.npmjs.com/package/@icp-sdk/canisters)
