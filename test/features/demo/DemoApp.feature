@demoHomePage
Feature: Demo Home page
  To check if user navigates to App from a demo app

  Background:
    Given User navigates to demo app page using

  Scenario Outline: HM_001 User navigation on Home page
    When user clicks on sign in with NFID link with <newWindowUrl>
    Then user should be switched to new window

    Examples:
      | App            | newWindowUrl                                                                              |
      | signInWithNFID | https://dq6kg-laaaa-aaaah-aaeaq-cai.ic0.app/authenticate/?applicationName=NFID-Demo |
