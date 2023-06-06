export const formatSeedPhrase = (string: string) => {
  // Replace newline characters with space
  let replacedString = string.replace(/\r?\n|\r/g, " ")

  // Replace non-alphanumeric characters except spaces with an empty string
  replacedString = replacedString.replace(/[^a-zA-Z0-9 ]/g, "")

  return replacedString
}
