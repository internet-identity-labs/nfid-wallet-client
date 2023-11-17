@registration @google @registration-with-google @only_deploy_to_main
Feature: Registration using Google

  @skip
  @register-with-google
  Scenario: User wants to register with Google
    Given User opens NFID site
    Given authstate is cleared
    Given I remove the e2e@identitylabs.ooo
    Given User authenticates to HomePage with google account
    And It log's me in
    And Tokens displayed on user assets
    When User opens profile menu
    Then NFID number is not zero

  @skip
  @login-with-google
  Scenario: User wants to login with Google
    Given User opens NFID site
    Given authstate is cleared
    Given User authenticates to HomePage with google account
    And It log's me in
    And Tokens displayed on user assets
    When User opens profile menu
    Then NFID number is not zero

  #wdio unable to click google iframe button
  @skip
  @mobile @pending @register-with-google-mobile
  Scenario: User wants to register with Google from mobile
    Given User opens NFID site
    Given authstate is cleared
    Given I remove the e2e@identitylabs.ooo
    Given User authenticates to HomePage with google account
    And It log's me in
    And Tokens displayed on user assets
    When User opens mobile profile menu
    Then NFID number is not zero
