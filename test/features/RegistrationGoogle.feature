@current @registration @google
Feature: Registration using Google

  Background: Open the link and ensure userE2E is deleted.
    Given I open the site "/register-nfid-account/intro"

  @uat
  @mission
  Scenario Outline: User wants to register with Google
    Given I remove the e2e@identitylabs.ooo
    When I pause for 500ms
    Then I wait on element "iframe[title='Sign in with Google Button']" for 1000ms to be displayed
    When I click on the selector "iframe[title='Sign in with Google Button']"
    When I pause for 500ms
    Then I expect a new window has been opened
    When I focus the last opened window
    Then I wait on element "#credentials-picker > div:first-child" for 4000ms to be displayed
    When I click on the selector "#credentials-picker > div:first-child"
    When I focus the previous opened window
    When I pause for 500ms
    Then I wait on element "#captcha-img" for 100000ms to be displayed
    And  I expect that element "#enter-captcha" not contains any text
    And  I expect that element "#create-nfid" has the class "btn-disabled"
    When I set "a" to the inputfield "#enter-captcha"
    And  I expect that element "#enter-captcha" contains the text "a"
    And  I expect that element "#create-nfid" does not have the class "btn-disabled"
    When I click on the selector "#create-nfid"
    Then I wait on element "#loader" for 15000ms to not be displayed
    Then I expect the url to not contain "/profile/assets"
    Then I wait on element "#profile" for 20000ms to be displayed
    When I click on the selector "#profile"
    Then I wait on element "#logout" for 15000ms to be displayed
    When I click on the selector "#logout"
    Then I expect the url to not contain "/profile/assets"
