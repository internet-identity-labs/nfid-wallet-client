import { ActorRefFrom, createMachine } from "xstate"

import { fetchChallenge } from "frontend/integration/internet-identity"
import { register } from "frontend/integration/internet-identity/services"
import { AuthSession } from "frontend/state/authentication"

interface Context {
  authSession?: AuthSession
  challengeKey?: string
}

type Events =
  | {
      type: "done.invoke.fetchChallenge"
      data: {
        pngBase64: string
        challengeKey: string
      }
    }
  | { type: "done.invoke.challengeTimer"; data: void }
  | { type: "done.invoke.register"; data: number }
  | { type: "SUBMIT_CHALLENGE"; data: unknown }
  | { type: "SUBMIT_CAPTCHA"; data: string }

const RegistrationMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEMCuAXAFgWgE5igEtZ1dl1CB7AOwDoBldZXdWgYU2QBsuxqZaAMTDoAxpgDEEGmFqFqAN0oBrWQDMR4jt178wiUAAdKsQhRoGQAD0QAWAOwAGWgGYATAA4AjLZcOPAKwuLgEBADQgAJ6Ifh60jgkJDgEAnABsbpm2AL7ZEWhYeATEpORUdIzMrNo8fAIA6shmUjJyiiqy4jp1YAAqhAC2YLiWxqbm1JY2CA7O7t6+-kEh4VExCfGJjmn2Xim2aTs5eSAFOPhEJGQTDEwstABKxSTD7JhgosoAghiSoyZmcpTGJpLy0NIeewBRz2NIpFIuDwedIRaIIUK2TYJNwpLxeWHIty5fK-IqXUo3Sr3J7k14ASWogO4NV0MAk9AAqgAhACydN6AH02AAJL4AGTFAFEAHIAcUl-3GQKQ1hBYIhUJhcIRSJRawQ9jcmK2LkcbhcsKSxNOpIuJWu5VuVUez3QrzYyEMYk47O5fMFbC+AAVeiKvorARYVdMXOlaLYPL4kbtkXi3KjEPZdrR4bn5o5li5rWcyfayjQndTXa8aSVhi1qLJ5EpVLQ7S8RiqxpHJtHEHivM4EvZAqb0lmPBmEPtnNCEn5fIadsXba6HRWqaxax2XbTcBJhrhKLhaIYuOQ1MeBm3q52jACJsCEC5QeDIdDYfDEci0lOPG5nFzFJ-xSNwvBWY4TmoSgIDgSwS3bClHU3N5uj0IRNEwCNHz7BBB3TfUXHxcFDjSAJAgRFJ7GOElCkQ9cKjuapOFqdDGjMbDlVAaYITBF8U1sWwAKNQSp3cZwvFI8jUljajHCLE4ELXctGOdFkek4qNuMzSd9UyewsUcQcQlxLMUhXOjlMpJjdzrE8OA+b5fk03ttLw5FwQCDIEzSBIBy8KdfJSQzwPhJFkQs84rOQmztzdE8GSZLh1L0Fyn0kuZ-w8RwhNsbYMVWNEU0MoiYShYIPEi0srhUyst1vdhPW9ZA0tw3ywS8d8cR2WFBN0tFvNoADsT8bYfDcAIqvo2qULimtb1atz8KnEc0hzICRO2Kboo3WKFq7B8uNVA1+rsbL1tzLN2qzewFNoqLyQYurFuOgJbCnfCLvhNIXzNcLJsU1dHtqyVqAgF7pgCewPqNMEti8VJyNukJtuBnD7yVLTjtNMTHFyXIgA */
  createMachine(
    {
      context: {},
      tsTypes: {} as import("./registration.typegen").Typegen0,
      schema: { events: {} as Events, context: {} as Context },
      id: "auth-registration",
      initial: "Start",
      states: {
        Start: {
          entry: (context) => console.log(context),
          type: "parallel",
          states: {
            Challenge: {
              initial: "Fetch",
              states: {
                Fetch: {
                  invoke: {
                    src: "fetchChallenge",
                    id: "fetchChallenge",
                    onDone: [
                      {
                        actions: "assignChallenge",
                        target: "Wait",
                      },
                    ],
                  },
                },
                Wait: {
                  invoke: {
                    src: "challengeTimer",
                    id: "challengeTimer",
                    onDone: [
                      {
                        target: "Fetch",
                      },
                    ],
                  },
                },
              },
            },
            Register: {
              initial: "CheckAuth",
              states: {
                CheckAuth: {
                  always: [
                    {
                      cond: "authenticated",
                      target: "Captcha",
                    },
                    {
                      target: "InitialChallenge",
                    },
                  ],
                },
                InitialChallenge: {
                  on: {
                    SUBMIT_CHALLENGE: {
                      target: "Captcha",
                    },
                  },
                },
                Captcha: {
                  on: {
                    SUBMIT_CAPTCHA: {
                      target: "Register",
                    },
                  },
                },
                Register: {
                  invoke: {
                    src: "register",
                    id: "register",
                    onDone: [
                      {
                        target: "#auth-registration.End",
                      },
                    ],
                    onError: [
                      {
                        target: "Captcha",
                      },
                    ],
                  },
                },
              },
            },
          },
        },
        End: {
          type: "final",
        },
      },
    },
    {
      services: {
        register,
        async challengeTimer(): Promise<void> {
          return new Promise((res) => setTimeout(res, 240_000))
        },
        fetchChallenge,
      },
      actions: {
        assignChallenge: (context, event) => console.log(event),
      },
      guards: {
        authenticated: (context) => !!context.authSession,
      },
    },
  )

export type RegistrationActor = ActorRefFrom<typeof RegistrationMachine>

export default RegistrationMachine
