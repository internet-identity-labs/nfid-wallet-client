@recoverNFID @smoke @regression
Feature: Recover NFID Account from Recovery Phrase
  As a user, I want to recover access to my NFID account by providing my Recovery Phrase

  Background:
    Given I open the site "/"

  @runOnly
  Scenario:
    When I click on the link "Recover NFID"
    Then I expect the url to contain "/recover-nfid/enter-recovery-phrase"

  @runOnlyonce
  Scenario:
    When I click on the link "Recover NFID"
    And I expect the url to contain "/recover-nfid/enter-recovery-phrase"
    And I set recover phrase "<phrase>" into text field "<recoverphrasetext>"
    # And I click on "<verifyCheckBox>"
    # And I click on continue button "<recoverButton>"
    # And I click on just log me in radio button "<justLogMeInRadioButton>"
    # And I click on submit button "<submitButton>"
    # Then user should be successfully logged in

    Examples:
      | phrase                                                                                                                                                               | recoverphrasetext       | verifyCheckBox             | recoverButton     | justLogMeInRadioButton       | submitButton       |
      | 1974576 adapt account broom index virtual decade destroy mother later critic upgrade endless tissue card board toward fat riot soon escape nerve sea improve exhibit | [name="recoveryPhrase"] | [id="has-verified-domain"] | 'button*=Recover' | [id="rb_link_account_login"] | 'button*=Continue' |
