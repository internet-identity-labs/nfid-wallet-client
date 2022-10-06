@recoverNFID @smoke @regression
Feature: Add protected/unportected, Protect, Delete recovery phrase
  As a user, I want to be able to add recovery phrase, protect it and delete

  Scenario:
    Given I open the site "/"
    Given My browser supports WebAuthN
    Given I remove the e2e@identitylabs.ooo
    Then I wait on element "iframe[title='Sign in with Google Button']" for 3000ms to be displayed
    And  I pause for 250ms

    When I click on the selector "iframe[title='Sign in with Google Button']"
    Then I expect a new window has been opened

    When I focus the last opened window
    Then I wait on element "#credentials-picker > div:first-child" for 4000ms to be displayed

    When I click on the selector "#credentials-picker > div:first-child"
    When I focus the previous opened window
    Then I wait on element "#captcha-img" for 10000ms to be displayed
    And  I expect that element "#enter-captcha" not contains any text
    And  I expect that element "#create-nfid" has the class "btn-disabled"

    When I set "a" to the inputfield "#enter-captcha"
    And  I expect that element "#enter-captcha" contains the text "a"
    And  I expect that element "#create-nfid" does not have the class "btn-disabled"
    When I click on the selector "#create-nfid"
    Then I wait on element "#loader" for 15000ms to not be displayed
    And  I wait on element "#just-log-me-in" to be displayed

    When I click on the selector "#just-log-me-in"
    Then I expect the url to contain "/profile/assets"
    And  I wait on element "#profile" for 20000ms to be displayed

    And I wait on element "#sendReceiveButton" for 10000ms to be displayed
    When I press button "#addRecovery > svg"
    Then I expect that element "#recoveryKey" is displayed
    Then I expect that element "#securityKey" is displayed

    When I press button "#recoveryKey"
    Then I wait on element "#loader" for 10000ms to not be displayed
    Then I wait on element "#copyButton > span" for 10000ms to be displayed
    Then I press button "#copyButton > span"
    Then I press button "#savedCheckbox"
    Then I press button "#recoverySaveButton"

    Then I wait on element "#recoveryPhrase" for 10000ms to be displayed
    Then I wait on element "#deleteRecoveryPhrase" for 10000ms to be displayed

    When I press button "#deleteRecoveryPhrase"

#    Then I put Recovery Phrase to input field "Incorrect Phrase"   //todo indicate toast message
#    Then I wait on element "Incorrect Seed Phrase"

    Then I put copied Recovery Phrase to input field
    Then I press button "#deleteRecoveryButton"
    Then I wait on element "#loader" for 10000ms to not be displayed
    Then I wait on element "#deleteRecoveryButton" for 10000ms to not be displayed

    Then  I wait on element "#deleteRecoveryPhrase" for 10000ms to not be displayed
    When I press button "#addRecovery > svg"
    Then I wait on element "#securityKey"
    Then I expect that element "#recoveryKey" is displayed



