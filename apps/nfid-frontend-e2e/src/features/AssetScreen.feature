@asset
Feature:Fungible Asset
  As a user, I want to see fungible assets in profile

  Scenario Outline: User should be able to see BTC in assets
    Given User opens NFID site
    And User is already authenticated with BTC
    Given User signs in
    And Tokens displayed on user assets
    And Asset appears with label <chain>
    And <asset> appears with <currency> on <chain> and <balance> && $0.00 USD
    And <chain> address calculated
    And <chain> USD balance not empty
    Examples:
      | chain   | currency | balance | asset   |
      | Bitcoin | BTC      | 0 BTC   | Bitcoin |

  Scenario Outline: User should be able to see BTC in asset details
    Given User opens NFID site
    And User is already authenticated with BTC
    Given User signs in
    And Tokens displayed on user assets
    And Open asset with label <chain>
    Then Wait while <chain> accounts calculated
    Then <chain> with <balance> <currency> in header
    Then 1 row in the table
    And NFID app account 1 with <balance> <currency> displayed
    And Identifiers are <principal> and <address>
    And Account balance in USD not empty
    Examples:
      | chain   | currency | balance    | principal | address |
      | Bitcoin | BTC      | 0.00012717 | 5qfm      | mvyM    |

  Scenario Outline: User should be able to see transaction history in Received
    Given User opens NFID site
    And User is already authenticated with BTC
    Given User signs in
    And Tokens displayed on user assets
    And Open asset with label <chain>
    Then Wait while <chain> accounts calculated
    And Open Received tab for first account
    Then 1 transaction in the table
    And Sent <balance> <currency>
    And <from> address <to>
    And Date is <millis>
    Examples:
      | chain   | currency | balance    | millis          | from                                       | to                                 |
      | Bitcoin | BTC      | 0.00012717 | 1677707789000 | tb1qxzwaumt2cjddwjwsnvwm9jsmmzyhjvdqn7q4p4 | mvyMknk9BfFAQp8tuErvozWaB6BsDtB2v1 |

  Scenario Outline: User should be able to see transaction depends on selected app
    Given User opens NFID site
    And User is already authenticated with BTC
    Given User signs in
    And Tokens displayed on user assets
    And Open asset with label <chain>
    Then Wait while <chain> accounts calculated
    Then Open Received tab for first account
    And Open dropdown menu on page
    Then Expect dropdown menu with text "1 selected"
    And Expect txs account "NFID account 1" with txs amount "1 TXs"
    And Expect checkbox for account "NFID account 1" is selected
    Then Click checkbox account NFID account 1
    Then Expect dropdown menu with text "All wallets"
    Then 1 transaction in the table
    Then Click checkbox account NNS account 1
    Then Expect txs account "NNS account 1" with txs amount "0 TXs"
    Then 0 transaction in the table
    Examples:
      | chain   |
      | Bitcoin |

  Scenario Outline: User should be able to filter assets by blockchain
    Given User opens NFID site
    And User is already authenticated
    Given User signs in
    And Tokens displayed on user assets
    Then Open filter menu on assets screen
    And Expect dropdown menu with text "All"
    And Open dropdown menu on page
    And Click checkbox chain <chain>
    Then Only 1 asset displayed
    Then Asset appears with label <chain>
    Examples:
      | chain   |
      | Bitcoin |
