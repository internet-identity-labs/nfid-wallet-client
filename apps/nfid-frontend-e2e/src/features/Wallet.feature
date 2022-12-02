@wallet @reg
Feature: Wallet transactions

  Background: Open the link and ensure userE2E is deleted.
    Given I open the site "/"
    Given My browser supports WebAuthN

  Scenario Outline: User wants to transfer ICPs to other account
    Then I wait on element "iframe[title='Sign in with Google Button']" for 3000ms to be displayed
    When I pause for 250ms
    When I click on the selector "iframe[title='Sign in with Google Button']"
    Then I expect a new window has been opened
    When I focus the last opened window
    Then I wait on element "#credentials-picker > div:first-child" for 4000ms to be displayed
    When I click on the selector "#credentials-picker > div:first-child"
    When I focus the previous opened window
    Then I wait on element "#loader" for 15000ms to not be displayed
    And  I wait on element "#just-log-me-in" to be displayed
    When I click on the selector "#just-log-me-in"
    Then I expect the url to contain "/profile/assets"
    And  I wait on element "#profile" for 20000ms to be displayed
    When I click on the selector "#profile"
    And I click on the sendreceive button selector "[alt='send/receive']"
    When I set "0.0001" to the inputfield "#input"
    When I set "a9fa4248e6826e4ca8c58938ce7c87575f099b79e438e3b664bd2cc48cb67448" to the inputfield "[name='address']"
    And  I pause for 3000ms
    When I click on the selector ".btn-primary.justify-center"

 Scenario Outline: User should be able to send more than 0 ICPs
    Then I wait on element "iframe[title='Sign in with Google Button']" for 3000ms to be displayed
    When I pause for 250ms
    When I click on the selector "iframe[title='Sign in with Google Button']"
    Then I expect a new window has been opened
    When I focus the last opened window
    Then I wait on element "#credentials-picker > div:first-child" for 4000ms to be displayed
    When I click on the selector "#credentials-picker > div:first-child"
    When I focus the previous opened window
    Then I wait on element "#loader" for 15000ms to not be displayed
    And  I wait on element "#just-log-me-in" to be displayed
    When I click on the selector "#just-log-me-in"
    Then I expect the url to contain "/profile/assets"
    And  I wait on element "#profile" for 20000ms to be displayed
    When I click on the selector "#profile"
    And I click on the sendreceive button selector "[alt='send/receive']"
    When I set "-2" to the inputfield "#input"
    When I set "a9fa4248e6826e4ca8c58938ce7c87575f099b79e438e3b664bd2cc48cb67448" to the inputfield "[name='address']"
    And  I pause for 3000ms
    When I click on the selector ".btn-primary.justify-center"

Scenario Outline: User should be able to send more than 0 ICPs
    Then I wait on element "iframe[title='Sign in with Google Button']" for 3000ms to be displayed
    When I pause for 250ms
    When I click on the selector "iframe[title='Sign in with Google Button']"
    Then I expect a new window has been opened
    When I focus the last opened window
    When I pause for 250ms
    And I click on the selector "#use-other"
    And I set "e2e2@identitylabs.ooo" to the inputfield "#identifierId"
    When I pause for 250ms
    And I click on the selector "#identifierNext"
    And  I pause for 3000ms
    And I set "P@$$word@1" to the inputfield "#password"
    And  I pause for 3000ms
    And I click on the selector "#passwordNext"
    When I focus the previous opened window
    And  I pause for 10000ms
    And  I wait on element "#just-log-me-in" to be displayed
    When I click on the selector "#just-log-me-in"
    Then I expect the url to contain "/profile/assets"
    And  I wait on element "#profile" for 20000ms to be displayed
    When I click on the selector "#profile"
    And I click on the sendreceive button selector "[alt='send/receive']"
    When I set "-2" to the inputfield "#input"
    When I set "a9fa4248e6826e4ca8c58938ce7c87575f099b79e438e3b664bd2cc48cb67448" to the inputfield "[name='address']"
    And  I pause for 3000ms
    When I click on the selector ".btn-primary.justify-center"

  Scenario:User wants to view ICP Balance
    Given I open the site "/recover-nfid/enter-recovery-phrase"
    When I set "14083 kind advance capital dignity giggle cigar dawn come hard miracle culture coffee opinion silk joke where basic stock pulse wisdom stuff congress drastic suspect" to the inputfield "[name='recoveryPhrase']"
    When I click on the selector "#has-verified-domain"
    And I click on the selector "#root > div:nth-child(2) > div.relative.flex.flex-col.w-full.min-h-screen.mx-auto.overflow-hidden.min-h-screen-ios > main > div > div > div > div > div > button"
    Then I wait on element "#loader" for 10000ms to not be displayed
    Then I wait on element "#just-log-me-in" for 10000ms to be displayed
    When I click on the selector "#just-log-me-in"
    And  I pause for 10000ms
    When I click on the selector "#desktop #profile-assets"
    And  I pause for 2000ms
    Then I expect that element "[class] tr .text-sm:nth-of-type(2)" is displayed
    And  I expect that element "[class] tr .text-sm:nth-of-type(2)" contains the text "0.001 ICP"
    And  I expect that element "[class] tr .text-sm:nth-of-type(3)" contains the text "$0.01"

   Scenario:User wants to view transactions history
    Given I open the site "/recover-nfid/enter-recovery-phrase"
    When I set "14083 kind advance capital dignity giggle cigar dawn come hard miracle culture coffee opinion silk joke where basic stock pulse wisdom stuff congress drastic suspect" to the inputfield "[name='recoveryPhrase']"
    When I click on the selector "#has-verified-domain"
    And I click on the selector "#root > div:nth-child(2) > div.relative.flex.flex-col.w-full.min-h-screen.mx-auto.overflow-hidden.min-h-screen-ios > main > div > div > div > div > div > button"
    Then I wait on element "#loader" for 10000ms to not be displayed
    Then I wait on element "#just-log-me-in" for 10000ms to be displayed
    When I click on the selector "#just-log-me-in"
    And  I pause for 10000ms
    When I click on the selector "#desktop #profile-assets"
    And  I pause for 2000ms
    Then I expect that element "[class='flex justify-between h-\[70px\] items-start mt-5'] [alt]" is displayed
    When I click on the selector "[class='flex justify-between h-\[70px\] items-start mt-5'] [alt]"
    Then I expect the url to contain "/profile/transactions"
    When I click on the selector ".font-bold.text-black-base"
    And  I pause for 350ms
    And  I expect that element "[class] td:nth-of-type(5) [class]" contains the text "9c1f1290263f6826a5a25a71fab360be40ab828a629705238a5a7aee01c1cadd"
