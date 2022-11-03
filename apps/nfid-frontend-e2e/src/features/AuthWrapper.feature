@authwrapper
Feature: AuthWrapper

  Scenario: Browser is not registered
    When I open the site "/profile/assets"
    Then I expect the url to not contain "/profile/assets"

  Scenario: Browser is registered
    Given My browser localStorage has a key "account" with value '{"anchor": 12345}'
    When I open the site "/profile/assets"
    Then I expect the url to not contain "/profile/assets"
    And I wait on element "#btn-signin" for 10000ms to exist
