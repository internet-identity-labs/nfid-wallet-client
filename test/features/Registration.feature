@registration @current
Feature: Registration from landing page

  Background: Background name
    Given I open the site "/register-nfid-account/intro"
    Given My browser supports WebAuthN

  @uat
  @mission
  Scenario Outline: User wants to register with WebAuthN

    Then I wait on element "#continue-with-enhanced-security" for 20000ms to be displayed
    When I click on the selector "#continue-with-enhanced-security"
    Then I wait on element "#loader" for 10000ms to not be displayed
    Then I expect the url to contain "/register-nfid-account/captcha"
    And  I expect that element "#captcha-spinner" is displayed

    Then I wait on element "#captcha-img" for 10000ms to be displayed

    And  I expect that element "#enter-captcha" not contains any text
    And  I expect that element "#create-nfid" has the class "btn-disabled"


    When I set "a" to the inputfield "#enter-captcha"
    And  I expect that element "#enter-captcha" contains the text "a"
    And  I expect that element "#create-nfid" does not have the class "btn-disabled"

    When I click on the selector "#create-nfid"
    # And My browser stores the credential
    Then I wait on element "#loader" for 10000ms to not be displayed
    Then I expect "account" key to be present in localStorage

# Then I expect the url to contain "/profile/security"
