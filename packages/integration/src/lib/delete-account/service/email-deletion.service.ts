import { authState } from "../../authentication/auth-state"
import { ic } from "../../agent"
import { antiPhishingCodeService } from "../../utils/anti-phishing-code.service"
import { DeletionStepService } from "../dto/deletion-step-service.dto"
import { DeletionMode } from "../enum/deletion-mode.enum"
import { DeletionError } from "../error/deletion.error"
import { EmailAlreadyDeletedError } from "../error/email-already-deleted.error"
import { IncorrectCodeError } from "../error/incorrect-code.error"

const SEND_DELETE_ACCOUNT_EMAIL_URL = ic.isLocal
  ? "/send_delete_account_email"
  : AWS_SEND_DELETE_ACCOUNT_EMAIL
const CONFIRM_DELETE_ACCOUNT_URL = ic.isLocal
  ? "/confirm_delete_account"
  : AWS_CONFIRM_DELETE_ACCOUNT

function getAccountData(): { email: string; principalId: string } {
  const { email, userId } = authState.getUserIdData()
  if (!email)
    throw new DeletionError(
      DeletionMode.EMAIL,
      false,
      "No email associated with this account",
    )
  return { email, principalId: userId }
}

export const emailDeletionService: DeletionStepService = {
  async isApplicable(): Promise<boolean> {
    return !!authState.getUserIdData().email
  },

  async prepare(): Promise<void> {
    try {
      const { email, principalId } = getAccountData()
      const antiPhishingCode = antiPhishingCodeService.generate()

      const response = await fetch(SEND_DELETE_ACCOUNT_EMAIL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          principal: principalId,
          antiPhishingCode,
        }),
      })

      if (!response.ok) {
        if (response.status === 429) {
          throw new DeletionError(
            DeletionMode.EMAIL,
            true,
            "Please wait for a minute before requesting another deletion code.",
          )
        }
        const text = await response.text()
        if (text.includes("Existance of email address cannot be checked"))
          throw new EmailAlreadyDeletedError(text)

        throw new DeletionError(DeletionMode.EMAIL, false, text)
      }
    } catch (error) {
      if (error instanceof DeletionError) throw error
      throw new DeletionError(
        DeletionMode.EMAIL,
        false,
        (error as Error).message,
      )
    }
  },

  async execute(code: string): Promise<void> {
    try {
      const { email } = getAccountData()

      const response = await fetch(CONFIRM_DELETE_ACCOUNT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      })

      if (!response.ok) {
        const text = await response.text()
        if (response.status === 400) {
          if (text.includes("Invalid deletion code"))
            throw new IncorrectCodeError(text)
          throw new DeletionError(DeletionMode.EMAIL, false, text)
        }
        throw new DeletionError(DeletionMode.EMAIL, false, text)
      }
    } catch (error) {
      if (error instanceof DeletionError) throw error
      if (error instanceof IncorrectCodeError) throw error
      throw new DeletionError(
        DeletionMode.EMAIL,
        false,
        (error as Error).message,
      )
    }
  },
}
