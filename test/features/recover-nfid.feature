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
    And I enter recover phrase "<phrase>" into "<recover phrase text area>"
    And I click on "<verify check box>"
    And I click on continue button "<recover button>"
    And I click on just log me in radio button "<radio button>"
    And I click on submit button "<submit button>"
    Then user should be successfully logged in

    Examples:
      | phrase                                                                                                                                                               | recover phrase text area | verify check box           | recover button    | just log me in radio button  | submit button      |
      | 1974576 adapt account broom index virtual decade destroy mother later critic upgrade endless tissue card board toward fat riot soon escape nerve sea improve exhibit | [name="recoveryPhrase"]  | [id="has-verified-domain"] | 'button*=Recover' | [id="rb_link_account_login"] | 'button*=Continue' |
