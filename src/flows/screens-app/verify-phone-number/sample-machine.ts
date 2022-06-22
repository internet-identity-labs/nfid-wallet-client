import { createMachine } from "xstate"

const IdentityProviderMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEkJgHYBcCWmCeACgE4D2AbtmkQHTLpoAeAxABICCAygPoCqHAogCUuAOR4BZAEJDEoAA4lYubCXSyQDRAFoAjAGYd1PQDYALDoBMpgAw6ArAHZrATgcAaEHm07jz6g7trM2sbOwAOOx0HAF9oj1QMHHxickowGjpGJhEAeV4BYTEpGSQQBSUcVXVNBF0DIzNLG3snVw8vWr1nPwCg8xDrCx0ImLiQBKxcQlIKKmo2AFdMAAsAaXQSAHd0NnQAY2WSIiYAGRyAcWQRdXLlKtKaizC9alM9CwdnMOeTBwcw9reYyGcJdBw6CE6FwmYyxeJoSbJGZpGiLFbrLY7faHY4AEWQADECUJ+CIACo3RR3NQPRBPF5vD5fH7GP4AzzaJ7WagWQLGLo2MJfZymWFjCZJaapOZo5Y8dAAaw2212ByOpwuV0pFRUNNANWMdlM1G6dieZuatnZHS0T0M1merg+pgs7w+o3hiSmKVm6XmSzliuVWLVx0E-EuHDJJXkVMqeo0iENxtN5qstitgM6Fj8DrBxmsIX+ULscPGCMlPpR1AAwgBDOSYA51pgcHg1mv8DgcbXU6qIVwg6wGFz2MJORxZrTvXOOhwFothEtliXe5FzDhgAA2YD2mDYez2JAWWFb-BO-BrFNKt3j-YQg+ogRHzjHE-cHNqUW5oOcxisEIWNYgSluKFZrtKfqCLu5DpIQyxEHWsBgOcGBMAAml2vZ3rSCD6Ly-jznYeifOES4fjapimHYrxRFywLDo41geuWXpIpBNDQUeZBwQQCFIShaG5Nhur3vhNF-IaJHOGRURTu83Kvg4ehBOChauiu4Hsb6nEwTxRDwYhyFMLiOQiPwIn3PqiA+A6Riiq+OjOLY-zAVOVE0eYDj0VCehMaMYwbGg8ClKu2nVpkYA1LGOpWYmnTzkY4LOBYrL0n5U5DA4Jp0X+JFCsBGlgWxUo6f66LBqqOKWQmBrGuOgz-OCkQRBln66AE-h8qKhrfH+4SaSVVYygG8pKpiVVHDV97mGERgRM4egmEMhXGJlMk8nygyuGEQGOHog2IqV1b1o2zbTbhnx+FybxhKYpr2BY8l+dQeZfBYvL-Klh2Vuufqbjue4HkeJ6YBd1kIK5T4ujo5hAc5Ml2FOUTGE+jp6KKYTDlCwE-RBZVcbBBl8UZgkJreom4VCG1Gt0S5fCRS1I+1TOvY6u2fbtYqekdw1QXpvH8ch4PxbDzGvJ8vgYw6Lree5kS0d5ZrjiK-54+FcxkukAC22DoAsIUxX2VMTtQ45LnYxHzmEZjyalOXKQ5phOMxf7q8dVAizUWg2NyJFOal3k-MzNoWorro9TYTgWLEsRAA */
  createMachine({
    id: "IdentityProvider",
    initial: "Index",
    states: {
      Index: {
        entry: "GetUserNumber",
        on: {
          HAS_USER_NUMBER: {
            target: "AuthKnownAnchor",
          },
          NO_USER_NUMBER: {
            target: "AuthUnknownAnchor",
          },
        },
      },
      AuthKnownAnchor: {
        on: {
          LOGIN: {
            target: "SelectAccount",
          },
          DIFFERENT: {
            target: "AuthUnknownAnchor",
          },
        },
      },
      AuthUnknownAnchor: {
        on: {
          LOGIN: {
            target: "SelectAccount",
          },
          REGISTER: {
            target: "Captcha",
          },
        },
      },
      Captcha: {
        on: {
          SUCCESS: {
            target: "RecoveryPhraseGen",
          },
        },
      },
      SelectAccount: {
        on: {
          SELECT: {
            target: "Terminus",
          },
        },
      },
      RecoveryPhraseGen: {
        on: {
          YES: {
            target: "RecoveryPhrase",
          },
          NO: {
            target: "Terminus",
          },
        },
      },
      RecoveryPhrase: {
        on: {
          DONE: {
            target: "Terminus",
          },
        },
      },
      Terminus: {},
    },
  })
