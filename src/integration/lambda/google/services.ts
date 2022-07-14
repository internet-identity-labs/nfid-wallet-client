import { GoogleAuthSession } from "frontend/state/authentication"

import {
  GoogleDeviceResult,
  fetchGoogleDevice as _fetchGoogleDevice,
  signInWithGoogle as _signInWithGoogle,
} from "."

/**
 * xstate guard determining if account already exists from a google device result
 * @param context unused
 * @param event an event which provices a GoogleDeviceResult
 * @returns boolean google account exists
 */
export function isExistingGoogleAccount(
  context: unknown,
  event: { data: GoogleDeviceResult },
) {
  return event.data.isExisting
}

/**
 * xstate service shallow wrap of the fetchGoogleDevice method
 * @param context unused
 * @param event an event which provides an oauth credential from google
 * @returns a google device response
 */
export function fetchGoogleDevice(context: unknown, event: { data: string }) {
  return _fetchGoogleDevice(event.data)
}

/**
 * xstate service shallow wrap of the signInWithGoogle method
 * @param context unused
 * @param event an event which provides a GoogleDeviceResult
 * @returns a google auth session
 */
export async function signInWithGoogle(
  context: unknown,
  event: { data: GoogleDeviceResult },
): Promise<GoogleAuthSession> {
  return _signInWithGoogle(event.data)
}
