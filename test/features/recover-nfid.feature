@recoverNFID @smoke @regression
Feature: Recover NFID Account from Recovery Phrase
  As a user, I want to recover access to my NFID account by providing my Recovery Phrase

  Background:
    Given I open the site "/"

  Scenario:
    When I click on the link "Recover NFID"
    Then I expect the url to contain "/recover-nfid/enter-recovery-phrase"

  @recoverNFID
  Scenario:
    When I click on the link "Recover NFID"
    And I expect the url to contain "/recover-nfid/enter-recovery-phrase"
    And I set recover phrase "<phrase>" into text field "<recoverphrasetext>"
    And I click on check box "<verifyCheckBox>"
    And I click on continue button "<recoverButton>"
    And I click on just log me in radio button "<justLogMeInRadioButton>"
    And I click on submit button "<submitButton>"
    Then I expect that user successfully logged into the app with element "<element>" displayed in the user profile section

    Examples:
      | phrase                                                                                                                                                               | recoverphrasetext                                                                                                                                                      | verifyCheckBox       | recoverButton                                                                                                                                     | justLogMeInRadioButton | submitButton                                                                                                                                     | element                                                                                                                                                                             |
      | 1974576 adapt account broom index virtual decade destroy mother later critic upgrade endless tissue card board toward fat riot soon escape nerve sea improve exhibit | #root > div > div.relative.flex.flex-col.w-full.min-h-screen.mx-auto.min-h-screen-ios.overflow-clip > main > div > div > div > div > div > div:nth-child(3) > textarea | #has-verified-domain | #root > div > div.relative.flex.flex-col.w-full.min-h-screen.mx-auto.min-h-screen-ios.overflow-clip > main > div > div > div > div > div > button | #rb_link_account_login | #root > div > div.relative.flex.flex-col.w-full.min-h-screen.mx-auto.min-h-screen-ios.overflow-clip > main > div > div > div > div.mt-6 > button | #root > div > div.relative.flex.flex-col.w-full.min-h-screen.mx-auto.min-h-screen-ios.overflow-clip > main > div.px-5.md\:px-16.pt-5.bg-white.overflow-hidden > div > div.mb-3 > h5 |
