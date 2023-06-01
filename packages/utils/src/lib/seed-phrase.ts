export const formatSeedPhrase = (string: string) => {
  // Replace newline characters with space
  let replacedString = string.replace(/\r?\n|\r/g, " ")

  // Replace non-alphanumeric characters except spaces with an empty string
  replacedString = replacedString.replace(/[^a-zA-Z0-9 ]/g, "")

  // Replace multiple spaces with a single space
  replacedString = replacedString.replace(/\s+/g, " ").trim()

  return replacedString
}
