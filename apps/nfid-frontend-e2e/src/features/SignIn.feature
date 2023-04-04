Feature: Sign in

  
  Scenario: User Signs In with predefined credentials
    Given User opens NFID site
    And User is already authenticated with
    Given User signs in
    And Tokens displayed on user assets
    When User opens profile menu
    Then NFID number is not zero

  @pending
  Scenario: User Signs In with NFID number

  @pending
  Scenario: User Signs In from Third-Party app (DSCVR)

  Scenario: User authenticates with recovery phrase (FAQ)
    Given User opens NFID site
    When I click on the link FAQ
    And User goes to recover account with FAQ
    And User authenticates with a phrase
    And It log's me in
    When User opens profile menu
    Then NFID number is not zero


  @mobile
  Scenario: User Signs In from mobile
    Given User opens NFID site
    And User is already authenticated with
    Given User signs in from mobile
    And Tokens displayed on user assets
    When User opens mobile profile menu
    Then NFID number is not zero
