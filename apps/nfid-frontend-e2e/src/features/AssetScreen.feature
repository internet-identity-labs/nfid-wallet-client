@asset
Feature:Fungible Asset
  As a user, I want to see fungible assets in profile

  Scenario Outline: User should be able to see BTC in assets
    Given User opens NFID site
    And User is already authenticated with BTC
    Given User signs in
    And Tokens displayed on user assets
    And Asset appears with label <chain>
    And Asset <chain> appears with currency <currency> and blockchain <chain> balance <balance> and <usd>
    Then <chain> address calculated
    And <chain> USD balance not <usd>
    Examples:
      | chain   | currency | balance | usd   |
      | Bitcoin | BTC      | 0 BTC   | $0.00 |

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
    And Principal is <principal> and address is <address>
    And Account balance USD not <usd>
    Examples:
      | chain   | currency | balance    | usd   | principal | address |
      | Bitcoin | BTC      | 0.00012717 | $0.00 | 5qfm      | mvyM    |

  Scenario Outline: User should be able to see transaction history in Received
    Given User opens NFID site
    And User is already authenticated with BTC
    Given User signs in
    And Tokens displayed on user assets
    And Open asset with label <chain>
    Then Wait while <chain> accounts calculated
    And Open first account in the row
    And Open Received tab
    Then 1 transaction in the table
    And Sent <balance> <currency>
    And From <from> to <to>
    And Date is <date> millis
    Examples:
      | chain   | currency | balance    | date          | from                                       | to                                 |
      | Bitcoin | BTC      | 0.00012717 | 1677707789000 | tb1qxzwaumt2cjddwjwsnvwm9jsmmzyhjvdqn7q4p4 | mvyMknk9BfFAQp8tuErvozWaB6BsDtB2v1 |

  Scenario Outline: User should be able to see transaction depends on selected app
    Given User opens NFID site
    And User is already authenticated with BTC
    Given User signs in
    And Tokens displayed on user assets
    And Open asset with label <chain>
    Then Wait while <chain> accounts calculated
    And Open first account in the row
    And Open Received tab
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
