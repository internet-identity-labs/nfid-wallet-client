import { Principal } from '@dfinity/principal';

export const DEFAULT_GATEWAY = new URL(
  self.location.protocol + '//' + 'icp-api.io'
);

export const hostnameCanisterIdMap: Map<string, Principal> = new Map(
  Object.entries({
    'nfid.one': Principal.from('3y5ko-7qaaa-aaaal-aaaaq-cai'),
    'nfid.dev': Principal.from('n2mln-sqaaa-aaaag-abjoa-cai'),
  })
);
