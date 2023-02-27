import { HomePage } from "./home-page";

class RecoveryPage extends HomePage {

    private get phraseTextarea() {
        return $("textarea");
    }

    private get confirmationCheckMark() {
        return $("#has-verified-domain");
    }

    private get recoveryButton() {
        return $("#recovery-button");
    }

    public async recoverAccountWithThePhrase(phrase: string) {
        await this.phraseTextarea.waitForDisplayed({ timeout: 6000, timeoutMsg: "Recovery Phrase input is missing!" })
        await this.phraseTextarea.setValue(phrase)
        await this.confirmationCheckMark.click()
        await this.recoveryButton.waitForDisplayed({ timeout: 3000, timeoutMsg: "Recovery Butotn is missing" })
        await this.recoveryButton.click()
    }

}

export default new RecoveryPage();