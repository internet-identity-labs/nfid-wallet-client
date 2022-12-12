export function snakeToCamel(obj: any): any {
  if (typeof obj !== "object" || obj === null) {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map((element) => snakeToCamel(element))
  }

  const camelObj: any = {}

  for (const [key, value] of Object.entries(obj)) {
    camelObj[key.replace(/_\w/g, (match) => match[1].toUpperCase())] =
      snakeToCamel(value)
  }

  return camelObj
}
