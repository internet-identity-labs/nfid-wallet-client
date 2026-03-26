Feature: Address Book
  As a user, I want to add a contact to the address book

  @addressbook @desktop
  Scenario Outline: User checks his activity history
    Given User opens NFID site
    And User is already authenticated by <nfid number> anchor
    Then Verifying that tokens are displayed on assets tab
    When User opens Menu dialog window
    And User goes to AddressBook page
    And User removes contact with name <contactName> if exists
    And User adds a contact with name "<contactName>" and <chain> address "<address>"
    Then The contact with name "<contactName>" and <chain> address "<address>" is added
    When User clicks the Back button
    When User opens Send dialog window
    And User clicks the AddressBook button the on Send dialog window
    Then There is a contact with name "<contactName>" and address <address>
    Examples:
      | nfid number | contactName   | chain        | address                                                          |
      | 10974       | ICPWalletTest | icpAccountId | 7255539e38f2035fde19be6925afa78cad5237860b1826eab09b3f7e164e9b40 |

  @addressbook @mobile
  Scenario Outline: User checks his activity history
    Given User opens NFID site
    And User is already authenticated by <nfid number> anchor
    Then Verifying that tokens are displayed on assets tab
    When User opens Menu dialog window
    And User goes to AddressBook page
    And User removes contact with name <contactName> if exists
    And User adds a contact with name "<contactName>" and <chain> address "<address>"
    Then The contact with name "<contactName>" and <chain> address "<address>" is added
    When User clicks the Back button
    When User opens Send dialog window
    And User clicks the AddressBook button the on Send dialog window
    Then There is a contact with name "<contactName>" and address <address>
    Examples:
      | nfid number | contactName   | chain        | address                                                          |
      | 25795       | ICPWalletTest | icpAccountId | 7255539e38f2035fde19be6925afa78cad5237860b1826eab09b3f7e164e9b40 |
