@homePage @smoke @regression
Feature: Home page
  To check if user navigation features on Home page

  Background: Background name
    Given I open the site "/"

  @uat
  @mission
  Scenario Outline: User navigates sections on home page
    When I click on the link "<link>"
    Then I expect that element "<element>" becomes displayed

    Examples:
      | link               | element         |
      | The Identity Layer | #home           |
      | Only with NFID     | #only-with-nfid |
      | Our mission        | #our-mission    |
      | FAQ                | #faq            |



