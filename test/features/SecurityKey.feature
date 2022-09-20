@registration @security
Feature: Manage Security Key as a Recovery device

  Background: Open the link and sign in with Google.
    Given I open the site "/"
    Given My browser supports WebAuthN


  Scenario Outline: User wants to add Security Key as recovery device
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

    #navgation to security page
    When I click on the selector "[class='sticky top-4'] div:nth-of-type(4)"
    Then I expect the url to contain "/profile/security"
    And  I expect that element "div:nth-of-type(3) > .mb-3.text-xl" contains the text "Account recovery methods"

    When I click on the selector ".absolute.cursor-pointer.h-6.right-5.sm\:right-\[30px\].sm\:top-\[30px\].text-gray-500.top-4.w-6"
    Then I wait on element ".flex-auto.px-6.relative" for 3000ms to be displayed
    When I pause for 7350ms

    When I click on the selector "[class='mt-3 space-y-2'] div:nth-of-type(3)"
    Then I wait on element "#root > div.relative.min-h-screen.overflow-hidden > div.block.relative.z-1.px-4.sm\:gap-\[30px\].sm\:px-\[30px\].md\:grid.md\:grid-cols-\[50px\,1fr\].lg\:grid-cols-\[256px\,1fr\] > section > div.fixed.top-0.bottom-0.left-0.right-0.z-50.w-full.h-full" for 120000ms to not be displayed
    When I pause for 1000ms
    And  I expect that element "[class='flex flex-wrap items-center flex-1 px-3 py-0 cursor-pointer select-none peer']" contains the text "Security Key"

    #logout -> login to verify securty key added successfully
    When I click on the selector "#profile"
    Then I wait on element "#logout" for 15000ms to be displayed
    When I click on the selector "#logout"
    Then I wait on element "#profile" for 2000ms to not be displayed








