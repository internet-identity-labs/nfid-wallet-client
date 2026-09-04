import { DeletionStepService } from "../dto/deletion-step-service.dto"

export const defaultDeletionService: DeletionStepService = {
  async isApplicable(): Promise<boolean> {
    return true
  },

  async prepare(): Promise<void> {},

  async execute(): Promise<void> {},
}
