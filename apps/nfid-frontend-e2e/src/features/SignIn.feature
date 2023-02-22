Feature: Sign in

  Scenario: User Signs In with predefined credentials
    Given User opens NFID site
    And User is already authenticated
    Given User signs in
    And Tokens displayed on user assets
    When User opens profile menu
    Then NFID number is not zero

  @pending
  Scenario: User Signs In with NFID number

  @pending
  Scenario: User authenticates with recovery phrase (FAQ)

  @mobile
  Scenario: User Signs In with predefined credentials from mobile
    Given User opens NFID site
    And User is already authenticated
    Given User signs in from mobile
    And Tokens displayed on user assets
    When User opens mobile profile menu
    Then NFID number is not zero
