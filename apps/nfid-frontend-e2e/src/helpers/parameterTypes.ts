import { defineParameterType } from "@cucumber/cucumber"

defineParameterType({
  name: "token",
  regexp: /\$NFIDW|\$ICP|\$BOOM/,
  transformer: (input: string) => {
    const map: Record<string, string> = {
      "$NFIDW": "NFIDWallet",
      "$ICP": "Internet Computer",
      "$BOOM": "BOOM",
    }
    return map[input] || input
  },
})

defineParameterType({
  name: "list",
  regexp: /[^,]+(?:\s*,\s*[^,]+)*/,
  transformer: (s: string) => {
    const map: Record<string, string> = {
      "$NFIDW": "NFIDWallet",
      "$ICP": "Internet Computer",
    }
    return s
      .split(/\s*,\s*/)
      .map(token => map[token] || token)
  },
})

defineParameterType({
  name: "lockTime",
  regexp: /1 month|(?:[2-9]|1[0-1]) months|1 year/,
  transformer: (value: string) => value,
})

