@current @wallet
Feature: Wallet feature

  Background: Background name
    Given I open the site "/register-nfid-account/intro"
    Given My browser supports WebAuthN

  @uat
  @mission
  Scenario Outline: User wants to see his balance

    Then I wait on element "#continue-with-enhanced-security" for 20000ms to be displayed
    When I click on the selector "#continue-with-enhanced-security"
    Then I wait on element "#loader" for 100000ms to not be displayed
    Then My browser has 1 credentials

    Then I expect the url to contain "/register-nfid-account/captcha"
    And  I expect that element "#captcha-spinner" is displayed

    Then I wait on element "#captcha-img" for 10000ms to be displayed

    And  I expect that element "#enter-captcha" not contains any text
    And  I expect that element "#create-nfid" has the class "btn-disabled"


    When I set "a" to the inputfield "#enter-captcha"
    And  I expect that element "#enter-captcha" contains the text "a"
    And  I expect that element "#create-nfid" does not have the class "btn-disabled"

    When I click on the selector "#create-nfid"
    Then I wait on element "#loader" for 10000ms to not be displayed

    Then I expect "account" key to be present in localStorage
    Then I wait on element "#sendReceiveButton" for 10000ms to be displayed
    Then I expect that element "#sendReceiveButton" is displayed

#    to be continued Expect Empty Balance


