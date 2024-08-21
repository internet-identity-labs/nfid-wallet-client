export function trimConcat(y: string, x: string) {
  return y + x.replace(/\s|#/g, "")
}
