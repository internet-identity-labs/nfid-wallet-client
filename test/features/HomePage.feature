@homePage @smoke @regression @reg
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
      | The Identity Layer | #home > div:nth-child(2) > div:nth-child(3) > div > p.leading-\[34px\].text-\[28px\].md\:text-\[32px\].z-20.md\:leading-\[40px\] |
      | Only with NFID     | //*[@id="only-with-nfid"]/div/h1                                                   |
      | Our mission        | #our-mission > div:nth-child(3) > h1                                         |
      | FAQ                | #faq > div.top-28 > h1                                                       |
