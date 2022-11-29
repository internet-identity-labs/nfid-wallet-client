import { ActorRefFrom, createMachine } from "xstate"

export interface AuthenticationMachineContext {
  anchor: number
}

export type Events =
  | { type: "NEW_NFID" }
  | { type: "EXISTING_NFID" }
  | { type: "CONNECT_WITH_ANCHOR" }
  | { type: "CONNECT_WITH_RECOVERY" }
  | { type: "CREATE_NEW_ANCHOR" }
  | { type: "CONNECT_RETRY" }
  | { type: "RECOVER_II_SUCCESS" }

export interface Schema {
  events: Events
  context: AuthenticationMachineContext
}

const AuthenticationMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEMCuAXAFgWgO4Estt98A6ASQDtCBBDTAdUM3PIGIA5AUQYH0OAYuQAiAbQAMAXUSgADgHtYhfPMoyQAD0TYArABZSAZkMAmcYYCMJnQBoQAT0QXSe8QDZrAX0920RAkQkFNTodFhMWKxsXAAa5ADKACrkHADi-EJiUuoKSugqakia2jo6pFa2DogmFgCcpGYA7OJ6bjriAByNHbXu3r70eMzEZKwAwgBOYMjoYBxguIIibGMA8hzcY4m8DOSJABK8NBxj+6sAShLSRbnKqupaCIZuHaSNJm0elY4I2G71HwszUMelqVgs4lqen6ID8OACOCC4ymMzmCyWwhW602212B145y4awAalxzgBNK45RR3QqgR7PZw6Oo6SzWOw-DwucQWCxtVkvQyNPQ6GFwoaBUbkSbTWbzRaZFaEmiJLj8HhHE5nS7ZG40-L3IqPXkmUi1Wo1LrfJwQs0mPSgh3WEU6RqinywwYIkYUaWqShgADGoUogcw8gmWI2RO2hMSFKperyBQeiFq+jN3R0ZkMtWMjT5HO0-wabiB5lB4Mh0I94u9SPI5yD8gAbmAJvYAAqYCbIWBgNiEklk3isXjxACqYzGXHi8UTcn1KaNiB69UabmeG7cenzhaqCC5rl5-OeHSFIu8Hso8ggcHUdeGSJCYUYzFY1OThvp2hMJkMDSuh0FRFggvLiHaDpQnozqlI0hhil6T5SjKqLyhin60qmYHPIBoHYAYHzphYOjmlWeZuoh-jIb6iSYPgEwQJ2yATOgPyLl+dLFGBrpGCBB41AC4jNK07RdD0fS1khkq+mM-pBiGYYRphBpcY8bgaaQzLpmy1q-CWgLApWNTVlR8I0awTaBq27Zdj2fZgCpy4-oebTlJCQp6UePJ8qUZ4Xu6AzUTJiQTKgsDoMIYAtvggaOUmWErmBFjAUYhkabuQr7pyprHr5ArnsKgWesFiJkFwlAQE537cVYkLlERQF5llbj4QZZZGWCJlQmZEpldVam-gWgHdPxPzYCRryAm4G76NpnRXp4QA */
  createMachine(
    {
      tsTypes: {} as import("./auth-with-ii.typegen").Typegen0,
      schema: {} as Schema,
      initial: "InitAuthWithII",
      id: "auth-with-ii",
      states: {
        InitAuthWithII: {
          on: {
            NEW_NFID: {
              target: "IICreateNewNFID",
            },
            EXISTING_NFID: {
              target: "IIThirdParty",
            },
          },
        },
        IICreateNewNFID: {
          on: {
            CONNECT_WITH_ANCHOR: {
              target: "IIConnectAnchor",
            },
            CONNECT_WITH_RECOVERY: {
              target: "IIRecoveryPhrase",
            },
            CREATE_NEW_ANCHOR: {
              target: "IIThirdParty",
            },
          },
        },
        IIThirdParty: {},
        IIConnectAnchor: {
          on: {
            CONNECT_RETRY: {
              target: "End",
            },
          },
        },
        IIRecoveryPhrase: {
          on: {
            RECOVER_II_SUCCESS: {
              target: "TrustDevice",
            },
          },
        },
        TrustDevice: {},
        End: {},
      },
    },
    {
      actions: {},
      guards: {},
      services: {},
    },
  )

export type AuthenticationActor = ActorRefFrom<typeof AuthenticationMachine>

export default AuthenticationMachine
