import { defineParameterType } from "@cucumber/cucumber"

defineParameterType({
  name: "token",
  regexp: /\$NFIDW|\$ICP/,
  transformer: (input: string) => {
    const map: Record<string, string> = {
      "$NFIDW": "NFIDWallet",
      "$ICP": "Internet Computer",
    }
    return map[input] || input
  },
})
