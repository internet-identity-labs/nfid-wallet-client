@registration @phone
Feature: User wants to veirfy his phone number

  Background: Open the link and ensure userE2E and user by test phone number are deleted
    Given I open the site "/"
    Given I remove the e2e@identitylabs.ooo
    Given I remove the account by phone number 380990374146

  Scenario Outline: User wants to veirfy his phone number
    Then I wait on element "iframe[title='Sign in with Google Button']" for 5000ms to be displayed
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
    And  I wait on element "#just-log-me-in" for 5000ms to be displayed
    When I click on the selector "#just-log-me-in"
    Then I expect the url to contain "/profile/assets"
    Then I wait on element "#loader" for 15000ms to not be displayed

    Then I wait on element "#desktop > #profile-credentials" for 2000ms to exist
    When I click on the selector "#desktop > #profile-credentials"
    Then I wait on element "#connect-mobile-phone-number" for 1000ms to be displayed
    When I click on the selector "#connect-mobile-phone-number"
    Then I wait on element "#phone-number" for 1000ms to be displayed
    When I click on the selector "#phone-number"
    And  I expect that element "#phone-number" not contains any text
    And  I expect that element "#add-phone-number" does not have the class "btn-disabled"

    When I click on the selector "#add-phone-number"
    Then I wait on element "#loader" for 15000ms to not be displayed
    Then I wait on element "#phone-number-error" for 1000ms to be displayed
    Then I expect that element "#phone-number-error" contains the text "Phone number is required"

    When I set "+3" to the inputfield "#phone-number"
    When I click on the selector "#add-phone-number"
    Then I wait on element "#loader" for 15000ms to not be displayed
    Then I wait on element "#phone-number-error" for 1000ms to be displayed
    Then I expect that element "#phone-number-error" contains the text "Phone number must be between 4 and 20 digits long"

    When I set "+38099" to the inputfield "#phone-number"
    When I click on the selector "#add-phone-number"
    Then I wait on element "#loader" for 15000ms to not be displayed
    Then I wait on element "#phone-number-error" for 1000ms to be displayed
    Then I expect that element "#phone-number-error" contains the text "Not a recognized carrier phone number."

    When I set "+14085550101" to the inputfield "#phone-number"
    When I click on the selector "#add-phone-number"
    Then I wait on element "#loader" for 15000ms to not be displayed
    Then I wait on element "#phone-number-error" for 1000ms to be displayed
    Then I expect that element "#phone-number-error" contains the text "Please use a mobile phone number."

    When I set "+46731297658" to the inputfield "#phone-number"
    When I click on the selector "#add-phone-number"
    Then I wait on element "#loader" for 15000ms to not be displayed
    Then I wait on element "#phone-number-error" for 1000ms to be displayed
    Then I expect that element "#phone-number-error" contains the text "This phone number cannot be accepted."

    When I set "+380" to the inputfield "#phone-number"
    When I click on the selector "#add-phone-number"
    Then I wait on element "#loader" for 15000ms to not be displayed
    Then I wait on element "#phone-number-error" for 5000ms to be displayed
    Then I expect that element "#phone-number-error" contains the text "Phone number must start with a '+' followed by digits"

    When I set "+380990374146" to the inputfield "#phone-number"
    When I click on the selector "#add-phone-number"
    Then I wait on element "#loader" for 15000ms to not be displayed
    Then I wait on element "#send-pin" for 5000ms to be displayed
    And  I expect that element "#send-pin" has the class "btn-disabled"
    Then I wait on element "#pin-input-0" for 1000ms to be displayed
    When I click on the selector "#pin-input-0"
    And  I expect that element "#pin-input-0" not contains any text
    When I press "00000"
    And  I expect that element "#send-pin" has the class "btn-disabled"
    When I press "0"
    And  I expect that element "#send-pin" does not have the class "btn-disabled"
    When I click on the selector "#pin-input-0"
    When I press "BACKSPACE"
    Then I wait on element "#send-pin" for 2000ms to not be enabled
    When I click on the selector "#pin-input-0"
    When I press "0"
    When I click on the selector "#send-pin"
    Then I wait on element "#loader" for 15000ms to not be displayed
    Then I expect that element "#pin-input-error" contains the text "Incorrect verification code, please try again."

    When I click on the selector "#pin-input-0"
    When I set "1" to the inputfield "#pin-input-0"
    Then I wait on element "#send-pin" for 5000ms to be displayed
    When I click on the selector "#send-pin"
    Then I wait on element "#loader" for 10000ms to be displayed
    Then I wait on element "#loader" for 10000ms to not be displayed

    Then I expect the url to contain "/profile/credentials"
    Then I wait on element "#loader" for 10000ms to be displayed
    Then I wait on element "#loader" for 10000ms to not be displayed
    Then I wait on element "#phone-number-value" for 15000ms to be displayed
    Then I expect that element "#phone-number-value" contains the text "+380990374146"

