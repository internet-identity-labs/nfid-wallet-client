@3rdPartyRegistration @mobile
Feature: Registration from third party application

  @skip
  Scenario: User registers with Enhanced Security
    Given User opens NFID /ridp/?secret=a464132b-328f-41cc-bbad-6a57a48f25df&scope=http%3A%2F%2Flocalhost%3A3000&derivationOrigin=&maxTimeToLive=606461760455083
    Given User authenticates with enhanced security
    And User enters a captcha
    When User opens mobile profile menu
    And User has account stored in localstorage
    Then NFID number is not zero
