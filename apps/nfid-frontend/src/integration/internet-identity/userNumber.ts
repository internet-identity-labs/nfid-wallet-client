export const getUserNumber = (
  userNumber: number | null,
): bigint | undefined => {
  return userNumber ? BigInt(userNumber) : undefined
}

// BigInt parses various things we do not want to allow, like:
// - BigInt(whitespace) === 0
// - Hex/Octal formatted numbers
// - Scientific notation
// So we check that the user has entered a sequence of digits only,
// before attempting to parse
export const parseUserNumber = (s: string): bigint | null => {
  if (/^\d+$/.test(s)) {
    try {
      return BigInt(s)
    } catch (_err) {
      return null
    }
  } else {
    return null
  }
}
