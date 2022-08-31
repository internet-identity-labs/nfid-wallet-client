@current @registration
Feature: Registration and login using Google

  Background: Open the link and ensure userE2E is deleted.
    Given I open the site "/register-nfid-account/intro"

  @uat
  @mission
  Scenario Outline: User wants to register and login with Google
    Given I remove the e2e@identitylabs.ooo
    Then I wait on element "iframe" for 20000ms to be displayed
    When I click on the selector "iframe"
    When I focus the last opened window
    When I click on the selector "div.fFW7wc-ibnC6b:first-child"
    When I focus the previously opened window
    Then I wait on element "#captcha-img" for 10000ms to be displayed
    And  I expect that element "#enter-captcha" not contains any text
    And  I expect that element "#create-nfid" has the class "btn-disabled"
    When I set "a" to the inputfield "#enter-captcha"
    And  I expect that element "#enter-captcha" contains the text "a"
    And  I expect that element "#create-nfid" does not have the class "btn-disabled"
    When I click on the selector "#create-nfid"
    Then I wait on element "#loader" for 60000ms to not be displayed
    When I click on the selector "#profile-icon"
    Then I wait on element "h2.mt-5.text-xl.font-bold.text-left" for 20000ms to be displayed

    Given I open the site "/register-nfid-account/intro"
    Then I wait on element "iframe" for 20000ms to be displayed
    When I click on the selector "iframe"
    When I focus the last opened window
    When I click on the selector "div.fFW7wc-ibnC6b:first-child"
    When I focus the previously opened window
    Then I wait on element "#profile-icon" for 20000ms to be displayed
    When I click on the selector "#profile-icon"
    Then I wait on element "h2.mt-5.text-xl.font-bold.text-left" for 20000ms to be displayed
