@homePage
Feature: Home page
  To check if user navigation features on Home page

  Background: Background name
    Given User navigates to home page using
  @mission
  Scenario Outline: HM_001 User navigates to Our Mission section

    When user clicks on <section> link on the navigation bar
    Then user should be navigated to <section>

    Examples:
      | section     |
      | Our Mission |
      | home        |
      | faqs        |
      | partners    |
