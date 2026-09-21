/**
 * Where the client-db stores keep their data for the current session.
 *
 * - `DISK`   — IndexedDB (+ raw `localStorage` for the string facade). The
 *              default; survives reload / tab close. A remembered device.
 * - `MEMORY` — an in-process `MemoryKeyVal` per store; nothing survives a
 *              reload or tab close. A device that opted out of "remember me".
 *
 * The switch is one-way (`DISK → MEMORY`) within a session. To go back the user
 * signs out and in again — a hard reload re-initialises the mode to `DISK`.
 */
export enum StorageMode {
  DISK = "DISK",
  MEMORY = "MEMORY",
}
