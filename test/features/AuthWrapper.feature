@authwrapper
Feature: AuthWrapper

  Scenario: Browser is not registered
    When I open the site "/profile/assets"
    Then I expect the url to contain "/"

  Scenario: Browser is registered
    Given My browser localStorage has a key "account" with value '{"anchor": 12345}'
    When I open the site "/profile/assets"
    Then I expect the url to contain "/profile/assets"
    And I wait on element "#unlock-nfid1" for 10000ms to be displayed
    And I expect that button "#unlock-nfid" contains the text "Unlock as 12345"
