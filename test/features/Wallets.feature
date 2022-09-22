@wallet @smoke @regression
Feature: Manage wallet features
  As a user, I want to be able to View Balance, Transaction History ,Send and Receive transactions


  Scenario:User wants to view ICP Balance
    Given I open the site "/recover-nfid/enter-recovery-phrase"
    When I set "14083 kind advance capital dignity giggle cigar dawn come hard miracle culture coffee opinion silk joke where basic stock pulse wisdom stuff congress drastic suspect" to the inputfield "[name='recoveryPhrase']"
    When I click on the selector "#has-verified-domain"
    And I click on the selector "#recoveryButton"
    Then I wait on element "#loader" for 10000ms to not be displayed
    Then I wait on element "#just-log-me-in" for 10000ms to be displayed
    When I click on the selector "#just-log-me-in"
    And I wait on element "#sendReceiveButton" for 10000ms to be displayed
    Then I expect that element "#sendReceiveButton" is displayed

    #navgation to assets
    When I click on the selector "#desktop #profile-assets"
    And  I pause for 10000ms
    Then I expect that element "[class] tr .text-sm:nth-of-type(2)" is displayed

    #view ICP balance
    And  I expect that element "[class] tr .text-sm:nth-of-type(2)" contains the text "0.001 ICP"

    #view dollar equivalence balance
    And  I expect that element "[class] tr .text-sm:nth-of-type(3)" contains the text "$0.01"




   Scenario:User wants to view transactions history
    Given I open the site "/recover-nfid/enter-recovery-phrase"
    When I set "14083 kind advance capital dignity giggle cigar dawn come hard miracle culture coffee opinion silk joke where basic stock pulse wisdom stuff congress drastic suspect" to the inputfield "[name='recoveryPhrase']"
    When I click on the selector "#has-verified-domain"
    And I click on the selector "#recoveryButton"
    Then I wait on element "#loader" for 10000ms to not be displayed
    Then I wait on element "#just-log-me-in" for 10000ms to be displayed
    When I click on the selector "#just-log-me-in"
    And I wait on element "#sendReceiveButton" for 10000ms to be displayed
    Then I expect that element "#sendReceiveButton" is displayed

    #navgation to assets
    When I click on the selector "#desktop #profile-assets"
    And  I pause for 10000ms
    Then I expect that element "[class='flex justify-between h-\[70px\] items-start mt-5'] [alt]" is displayed

    #view transaction history
    When I click on the selector "[class='flex justify-between h-\[70px\] items-start mt-5'] [alt]"
    Then I expect the url to contain "/profile/transactions"

    When I click on the selector ".font-bold.text-black-base"
    And  I pause for 350ms
    And  I expect that element "[class] td:nth-of-type(5) [class]" contains the text "9c1f1290263f6826a5a25a71fab360be40ab828a629705238a5a7aee01c1cadd"





