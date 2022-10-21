import { Response } from './_ic_api/identity_manager.did.d';

/**
 * Sanitize dfinity date object into js Date.
 * @param candid date as bigint with 6 extra digits
 * @returns js Date
 */
export function mapDate(candid: bigint): Date {
  const millis = Number(candid) / 10 ** 6;
  return new Date(millis);
}

/**
 * Transform javascript date as milliseconds to dfinity date format.
 */
export function reverseMapDate(number: number): bigint {
  return BigInt(number * 10 ** 6);
}

export function mapOptional<T>(value: [T] | []): T | undefined {
  if (value.length) return value[0];
}

export function reverseMapOptional<T>(value?: T): [] | [T] {
  if (value) return [value];
  return [];
}

// NFID Canisters use this response pattern, which includes http status codes

interface NFIDResponse<T> {
  data: [] | [T];
  error: [] | [string];
  status_code: number;
}

type DiscriminatedNFIDResponse<T> =
  | { code: number; ok: true; data: T }
  | { code: number; ok: false; error: string };

/**
 * Cast NFID response interface into discriminated type.
 * @param response
 * @returns
 */
export function typeResponse<T>(
  response: NFIDResponse<T>
): DiscriminatedNFIDResponse<T> {
  if (response.data.length) {
    return { ok: true, code: response.status_code, data: response.data[0] };
  } else if (response.error.length) {
    return { ok: false, code: response.status_code, error: response.error[0] };
  }
  throw new Error(
    `typeResponse Unknown response type ${Object.keys(response)[0]}`
  );
}

export class NfidHttpError extends Error {
  code: number;
  constructor(message: string, code: number) {
    super(message);
    this.name = 'NfidHttpError';
    this.code = code;
  }
}

/**
 * Identity labs canisters use this uniform interface for message responses.
 * @param response {@link NFIDResponse} a standard NFID canister response
 * @returns
 */
export function unpackResponse<T>(response: NFIDResponse<T>) {
  const r = typeResponse(response);
  if (r.ok) {
    return r.data;
  } else {
    throw new NfidHttpError(`${r.code} error: ${r.error}`, r.code);
  }
}

/**
 * Map candid variant (union type) into string.
 * @param variant a candid variant type
 * @returns string as keyof variant
 */
export function mapVariant<T>(variant: T): keyof T {
  // @ts-ignore
  return Object.keys(variant)[0] as keyof T;
}

// Some older NFID canister methods do not use the above response pattern. The following methods deal with these older patterns.

/**
 * Discriminate legacy canister response into standard typed response.
 */
export function typeLegacyResponse(
  response: Response
): DiscriminatedNFIDResponse<null> {
  if (response.error.length) {
    return { ok: false, code: response.status_code, error: response.error[0] };
  } else {
    return { ok: true, code: response.status_code, data: null };
  }
}

/**
 * Unpack legacy NFID canister response type into boolean true or throw error.
 */
export function unpackLegacyResponse(response: Response) {
  const r = typeLegacyResponse(response);
  if (r.ok) {
    return true;
  } else {
    throw new Error(`unpackLegacyResponse ${r.code} error: ${r.error}`);
  }
}
