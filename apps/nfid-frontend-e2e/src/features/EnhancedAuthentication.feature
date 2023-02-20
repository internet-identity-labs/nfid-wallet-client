@registration @mobile @onlythis
Feature: Mobile registration and authentication

  @uat
  @mission
  @dev
  Scenario Outline: User wants to register with Enhanced Security
    Given User opens NFID site
    Given User authenticates with enhanced security
    And User enters a captcha
    And Tokens displayed on user assets
    When User opens mobile profile menu
    And User has account stored in localstorage
    Then NFID number is not zero

  Scenario Outline: User Signs In with predefined credentials
    Given User opens NFID site
    And User is already authenticated
    Given User signs in
    And Tokens displayed on user assets
    When User opens mobile profile menu
    And User has account stored in localstorage
    Then NFID number is not zero
