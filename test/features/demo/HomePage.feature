# @homePage
Feature: Home page
  To check if user navigation features on Home page

  # Background:


  # @mission
  Scenario Outline: HM_001 User navigates to Our Mission section
  Given User navigates to home page using <URL>
    When user clicks on our mission link on the navigation bar
    Then user should be navigated to <section>

    Examples:
      | URL                                              | section     |
      | https://dq6kg-laaaa-aaaah-aaeaq-cai.raw.ic0.app/ | Our Mission |


  # @home
  # Scenario Outline: HM_002 User navigates to Home section
  #   When user clicks on home link on the navigation bar
  #   Then user should be navigated to <section>

  #   Examples:
  #     | URL                                              | section |
  #     | https://dq6kg-laaaa-aaaah-aaeaq-cai.raw.ic0.app/ | home    |


  # @partners
  # Scenario Outline: HM_003 User navigates to Partners section
  #   When user clicks on partners link on the navigation bar
  #   Then user should be navigated to <section>

  #   Examples:
  #     | URL                                              | section  |
  #     | https://dq6kg-laaaa-aaaah-aaeaq-cai.raw.ic0.app/ | partners |

  # @faqs
  # Scenario Outline: HM_004 User navigates to FAQs section
  #   When user clicks on FAQs link on the navigation bar
  #   Then user should be navigated to <section>

  #   Examples:
  #     | URL                                              | section |
  #     | https://dq6kg-laaaa-aaaah-aaeaq-cai.raw.ic0.app/ | faqs    |
