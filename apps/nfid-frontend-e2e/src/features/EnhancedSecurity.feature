@registration @mobile
Feature: Enhanced security registration with mobile

  @skip
  Scenario: User wants to register with Enhanced Security
    Given User opens NFID site
    Given User authenticates with enhanced security
    And User enters a captcha
    And Tokens displayed on user assets
    When User opens mobile profile menu
    And User has account stored in localstorage
    Then NFID number is not zero

