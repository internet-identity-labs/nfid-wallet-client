export enum ServiceWorkerEvents {
  SaveICHostInfo = 'SaveICHostInfo',
}

export interface ICHostInfoEvent {
  canisterId: string;
}

export interface SaveICHostInfoMessage {
  action: ServiceWorkerEvents.SaveICHostInfo;
  data: ICHostInfoEvent;
}

export type VerificationMessage = {
  type: 'error' | 'info' | 'success';
  message: string;
  status: number;
  url?: string;
};
