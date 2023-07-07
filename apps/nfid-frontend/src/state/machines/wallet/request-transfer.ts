import { ActorRefFrom, assign, createMachine } from "xstate"

import {
  registerRequestTransferHandler,
  RequestTransferParams,
} from "@nfid/wallet"

import AuthenticationMachine from "frontend/features/authentication/root/root-machine"
import { AuthSession } from "frontend/state/authentication"
import { AuthorizingAppMeta } from "frontend/state/authorization"

// State local to the machine.
interface Context {
  appMeta?: AuthorizingAppMeta
  authSession?: AuthSession
  requestTransfer?: RequestTransferParams
  amount?: number
  to?: string
  isLoading?: boolean
  blockHeight?: bigint
}

let _blockHeight: number | null = null

// Definition of events usable in the machine.
type Events =
  | {
      type: "done.invoke.AuthenticationMachine"
      data: AuthSession
    }
  | {
      type: "done.invoke.registerRequestTransferHandler"
      data: RequestTransferParams
    }
  | { type: "CONSENT" }
  | { type: "CONFIRM"; blockHeight?: bigint }
  | { type: "REJECT" }
  | { type: "END" }

// The machine. Install xstate vscode extension for best results.
/** @xstate-layout N4IgpgJg5mDOIC5QAUAWB7AdmAcgVwFsAjMAJwGFTIxMAXASwEMAbZU9AN3ojIDoAlMIwgBPAMSJQAB3Sx6DLJJAAPRAEYAHGt4AWNQHYtAViMAGHRv2mATABoQI9UYCcO3mYDMpo-o-PNvjoAvkH2aFi4hCQUVDx0TKzsXDykvACCeLSoNAwAxoy0YGIQEbz0mBzoANZg6ZnZ8fkKmACyjLmo5WBKMnLNSqoIHgBs1rymw0Y6HnrOGhoeGs72jggGBrwapmomaqb6JjrbIWEY2PjEZJTU8SxsnNx8AOJgtOHnUc+vAKLK9LAMTBQd6RS6kYqlcqVGq8ABmrw6IIu0R6snk9EUSBUiD0Gl4gQ8Oxcw1Gww8RhWiGspg0Yw0OmsHl8RnJTI0wxOICRnxiNwYdySj1SLzeZ1B0V43zoZG5YLE3xwABVvvwAPrIAASAHkcN9VTgAKotABCKtRfQxmAGOI8Hk2fn0zn01mcpgmrkpCGsemGvGGmnpajUzhdk05sui1zi-MSDxSvBFEb4ADUyPRYSIk+CStgyhVqrUOGmM1mAMpkLi5bpY3rozGgQZ+ZzuJ3DN1LbY+fSe6zMzZGSwWdlePwc0JcsXIq6xHIJe7JL6iiJT1Kp0jpzOTnliMjsVJSZgFWHoUgEXhF9clrdg8ukSvV6Ro-pYwZqHRuPx6czDWnmObDHsLDtd9TGcIx-QOPYNHDa9IxnW5YwXYVXizSVpVIUsWlLRUC0wMRyA1NIcCePVNR1PVDRNM0ayfS1rTWbRnC8XtJkdNRqSDDQe2GfR9D9SxrB8Ix2JDXwYOXHko1nAU40XVCpUKDCsJwmo8IVZU1Uw0tVUVLUAGkFXNOsrRfHFhM2fQ9m2HjaQHZYHCpZwf10LRTBHIxvV7aDxyzKSEPnIUExQ2C+AUsgtJUmgxH4b5SwVAARIznwbKkpnxBl-F8QTvQmLiHK9fQdCMdwNDMXw1CZYkPHEj4wT8mMAvjRMQtXFhuAKMAItwiFcyhAtz2LERSwIWBb3vJK6NMhB6VMdwZi2LZhlcFkdB7fRRk2Ax5msLR2SDIwavFac+TnQUmuCiSwV4ZM2ogDqutUndSD3XgDyPE8zwvDdhtGit6CrCb62xL1rG0eYbDA70RjfHQAPyl1ePxQlvBcZ0eLmQ6V3q07ZOQpdauiHragBDreF8+CGrOuSWsBkyUoQOZtEmW09jbRYys9AxGV4W0HSc6xBJMA7OUwdAeHgLFyZOmSkIEIRRFp+iAFo9nGVndtAgcXRmTnwLtN0vAZLRYcdaxMckimcdljIslnJoHxAWtkuBrxZrbPWyRMb93118yDZR3saUEsdTkuuDpcQwLmrDxdfn+QFgRpmiLSBxtYd4ZbA6WSYnPs1Zg00XgBZMKwQymNyQ4nGPeWjK2o4ugnQvQrNFam99m0seY7Nmck8tWRlrF9H8jltFx2eqnyWuxmX6-xo7V0Glvk+M+iZl9TOrGz1HzB7cDfTUEkmPmZwnKWc26stmfzrnlc0MUh6aFb+nYbcL2luDKZ2Rsbt4csO0BaWK6L8zonTn3DrXK+1Nq7XVuvdZSuEn4ux0M2f0Hhg7bF4vtVa+UvBLTmhMaky0eLrTAcdCBkdr7yUwBARBr5QL7y3gyEw3oGQ9gqs2cCbkQy2mdDoMSk9q7TwoVAxupBaGIBVmMd0zoZjUksHMWknN6S+mLuBEMewPLC1DqIoRjU+BsDgDkIR4iGbeAzoPXibpvBHF7LrDang3KCxGHMYIAidGX2EWI5eztBhKxGOMJaMiGQ0kdPMTmfDmz+y0NSN0jJXEhCAA */
const RequestTransferMachine = createMachine(
  {
    context: {} as Context,
    tsTypes: {} as import("./request-transfer.typegen").Typegen0,
    schema: { events: {} as Events },
    id: "RequestTransferProvider",
    initial: "Ready",
    states: {
      Ready: {
        invoke: {
          src: "registerRequestTransferHandler",
          id: "registerRequestTransferHandler",
          onDone: {
            target: "Authenticate",
            actions: "assignRequestTransferRequest",
          },
        },
      },
      Authenticate: {
        invoke: {
          src: "AuthenticationMachine",
          id: "AuthenticationMachine",
          onDone: [{ target: "RequestTransfer", actions: "assignAuthSession" }],
          data: (context) => ({
            appMeta: context.appMeta,
          }),
        },
      },
      RequestTransfer: {
        on: {
          CONFIRM: { target: "Confirm", actions: "assignBlockHeight" },
        },
      },
      Confirm: {
        onEntry: "setBlockHeight",
      },
      End: {
        type: "final",
      },
    },
  },
  {
    actions: {
      assignAuthSession: assign((_, event) => ({
        authSession: event.data,
      })),
      assignRequestTransferRequest: assign({
        requestTransfer: (_, event) => event.data,
      }),
      setBlockHeight: ({ blockHeight }) => {
        _blockHeight = Number(blockHeight)
      },
      assignBlockHeight: assign({
        blockHeight: (_, event) => event.blockHeight,
      }),
    },
    services: {
      async registerRequestTransferHandler() {
        const params = await registerRequestTransferHandler(() => {
          return new Promise((resolve) => {
            setInterval(() => {
              _blockHeight &&
                resolve({
                  status: "SUCCESS",
                  height: _blockHeight,
                })
            }, 1000)
          })
        })
        console.debug("registerRequestTransferHandler", { params })
        return params
      },
      AuthenticationMachine,
    },
    guards: {},
  },
)

export default RequestTransferMachine

export type RequestTransferMachineActor = ActorRefFrom<
  typeof RequestTransferMachine
>
export type RequestTransferMachineType = typeof RequestTransferMachine
