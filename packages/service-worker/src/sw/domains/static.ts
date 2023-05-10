import { Principal } from '@dfinity/principal';

export const DEFAULT_GATEWAY = new URL(
  self.location.protocol + '//' + 'icp-api.io'
);

export const hostnameCanisterIdMap: Map<string, Principal> = new Map(
  Object.entries({})
);
