export function camelCase(str: string): string {
  // Replace underscores at the end of the string
  str = str.replace(/_$/g, "")
  // Replace underscores that are not at the end of the string
  str = str.replace(/_\w/g, (match) => match[1].toUpperCase())

  return str
}

export function snakeToCamel(obj: any): any {
  if (typeof obj !== "object" || obj === null) {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map((element) => snakeToCamel(element))
  }

  const camelObj: any = {}

  for (const [key, value] of Object.entries(obj)) {
    camelObj[camelCase(key)] = snakeToCamel(value)
  }

  return camelObj
}
