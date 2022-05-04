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
      | link               | element                                                                      |
      | The Identity Layer | #home > div:nth-child(1) > div.sticky.z-30.sm\:mt-40.top-28 > div > div > h1 |
      | Only with NFID     | #only-with-nfid > div > h1                                                   |
      | Our mission        | #our-mission > div:nth-child(3) > h1                                         |
      | FAQ                | #faq > div.top-28 > h1                                                       |



