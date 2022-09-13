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
    Then I wait on element "#loader" for 30000ms to not be displayed
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
    When I pause for 350ms

    When I click on the selector "[class='mt-3 space-y-2'] div:nth-of-type(3)"
    Then I wait on element ".bottom-0.fixed.h-full.left-0.right-0.top-0.w-full.z-50" for 120000ms to not be displayed
    When I pause for 1000ms
    And  I expect that element "[class='flex flex-wrap items-center flex-1 px-3 py-0 cursor-pointer select-none peer']" contains the text "Security Key"

    #logout -> login to verify securty key added successfully
    When I click on the selector "#profile"
    Then I wait on element "#logout" for 15000ms to be displayed
    When I click on the selector "#logout"
    Then I wait on element "#profile" for 2000ms to not be displayed





 Scenario Outline: User wants to rename a Security Key
    Then I wait on element "iframe[title='Sign in with Google Button']" for 3000ms to be displayed
    When I pause for 250ms
    When I click on the selector "iframe[title='Sign in with Google Button']"
    Then I expect a new window has been opened
    When I focus the last opened window
    Then I wait on element "#credentials-picker > div:first-child" for 4000ms to be displayed
    When I click on the selector "#credentials-picker > div:first-child"
    When I focus the previous opened window
    Then I wait on element "#loader" for 30000ms to not be displayed

    Then I expect the url to contain "/profile/assets"
    And  I wait on element "#profile" for 20000ms to be displayed

    When I click on the selector "[class='sticky top-4'] div:nth-of-type(4)"
    Then I expect the url to contain "/profile/security"
    And  I expect that element "[class='flex flex-wrap items-center flex-1 px-3 py-0 cursor-pointer select-none peer']" contains the text "Security Key"

    #rename security key step
    When I click on the selector "[class='flex space-x-2'] div:nth-of-type(3) [height]"
    When I pause for 350ms
    When I set "IAM SK" to the inputfield ".flex-1.flex-shrink.px-2.py-1.rounded"
    When I click on the selector "div:nth-of-type(3) > svg"
    When I pause for 350ms
    Then I wait on element ".bottom-0.fixed.h-full.left-0.right-0.top-0.w-full.z-50" for 30000ms to not be displayed

    #verify security key name change
    When I click on the selector "[class='sticky top-4'] > div:nth-of-type(1)"
    When I pause for 350ms
    When I click on the selector "[class='sticky top-4'] div:nth-of-type(4)"
    Then I expect the url to contain "/profile/security"
    And  I expect that element "[class='flex flex-wrap items-center flex-1 px-3 py-0 cursor-pointer select-none peer']" contains the text "IAM SK"





 Scenario Outline: User wants to remove a Security Key
    Then I wait on element "iframe[title='Sign in with Google Button']" for 3000ms to be displayed
    When I pause for 250ms
    When I click on the selector "iframe[title='Sign in with Google Button']"
    Then I expect a new window has been opened
    When I focus the last opened window
    Then I wait on element "#credentials-picker > div:first-child" for 4000ms to be displayed
    When I click on the selector "#credentials-picker > div:first-child"
    When I focus the previous opened window
    Then I wait on element "#loader" for 30000ms to not be displayed

    Then I expect the url to contain "/profile/assets"
    And  I wait on element "#profile" for 20000ms to be displayed

    When I click on the selector "[class='sticky top-4'] div:nth-of-type(4)"
    Then I expect the url to contain "/profile/security"
    And  I expect that element "[class='flex flex-wrap items-center flex-1 px-3 py-0 cursor-pointer select-none peer']" contains the text "IAM SK"

    #remove security key step
    When I click on the selector "section div:nth-child(3) > div:nth-of-type(2) div:nth-of-type(4) [xmlns]"
    When I pause for 350ms

    #remove security key
    And  I wait on element "[class='relative flex-auto px-6 ']" for 1000ms to be displayed
    When I click on the selector "[class='btn cursor-pointer btn-large-max btn-error \!py-3 \!px-8']"
    Then I wait on element ".bottom-0.fixed.h-full.left-0.right-0.top-0.w-full.z-50" for 30000ms to not be displayed

    Then I expect the url to contain "/profile/security"



