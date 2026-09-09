export class RecoveryProvisioningError extends Error {
  constructor(message?: string) {
    super(message ?? "Recovery device provisioning did not complete")
  }
}
