@nfidwallets
Feature: Registration using Google

  Background: Open the link and ensure userE2E is deleted.
    Given I open the site "/"
    Given My browser supports WebAuthN

  Scenario Outline: User wants to register with Google
    Given I remove the e2e@identitylabs.ooo
    Then I wait on element "iframe[title='Sign in with Google Button']" for 3000ms to be displayed
    And  I pause for 250ms

    When I click on the selector "iframe[title='Sign in with Google Button']"
    Then I expect a new window has been opened

    When I focus the last opened window
    Then I wait on element "#credentials-picker > div:first-child" for 4000ms to be displayed

    When I click on the selector "#credentials-picker > div:first-child"
    When I focus the previous opened window
    Then I wait on element "#captcha-img" for 20000ms to be displayed
    And  I expect that element "#enter-captcha" not contains any text
    And  I expect that element "#create-nfid" has the class "btn-disabled"

    When I set "a" to the inputfield "#enter-captcha"
    And  I expect that element "#enter-captcha" contains the text "a"
    And  I expect that element "#create-nfid" does not have the class "btn-disabled"
    When I click on the selector "#create-nfid"
    Then I wait on element "#loader" for 20000ms to not be displayed
    And  I wait on element "#just-log-me-in" to be displayed

    When I click on the selector "#just-log-me-in"
    Then I wait on element "#loader" for 20000ms to not be displayed
    Then I expect the url to contain "/profile/assets"

    Then I expect that element "[class='flex items-center justify-between mb-3 text-xl']" is displayed
    And I click on the selector "[class='text-sm']"
    Then I expect that element "[class='overflow-hidden whitespace-nowrap']" is displayed
    Then I expect that element "[class='ml-4 font-semibold']" is displayed
    Then I expect that element "[class='text-[28px] block']" contains the text "Your Internet Computer wallets"
    When I click on the selector "#root > div.relative.min-h-screen.overflow-hidden > div.h-\[calc\(100vh-70px\)\].relative.z-1.px-4.sm\:gap-\[30px\].sm\:px-\[30px\].md\:grid.md\:grid-cols-\[50px\,1fr\].lg\:grid-cols-\[256px\,1fr\].overflow-auto.overflow-x-auto > section > div.flex.justify-between.h-\[70px\].items-start.mt-5 > div > button > div > div > svg"
    And I expect that element "[class='text-sm']" is displayed
