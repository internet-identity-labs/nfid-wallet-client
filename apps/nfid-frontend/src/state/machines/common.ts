import { ic } from "@nfid/integration"

// Guards

export function defined(context: any, event: { data: unknown | undefined }) {
  return event.data !== undefined
}

export function bool(context: any, event: { data: boolean }) {
  return event.data
}

export function isLocal() {
  return ic.isLocal
}

export function isDev() {
  return ic.isDev === "true"
}
