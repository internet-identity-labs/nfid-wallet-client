export function logServiceError(context: any, event: any) {
  console.error(`Service error at "${event.type}"\n`, event.data)
  console.info("Machine context", JSON.stringify(context, undefined, 4))
}
