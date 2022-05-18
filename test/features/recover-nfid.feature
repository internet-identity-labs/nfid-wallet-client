@recoverNFID @smoke @regression
Feature: Recover NFID Account from Recovery Phrase
  As a user, I want to recover access to my NFID account by providing my Recovery Phrase

  Background:
    Given I open the site "/"

  @runOnly
  Scenario:
    When I click on the link "Recover NFID"
    Then I expect the url to contain "/recover-nfid/enter-recovery-phrase"

  @runOnly
  Scenario:
    When I click on the link "Recover NFID"
    And I expect the url to contain "/recover-nfid/enter-recovery-phrase"
    And I enter recover phrase
    And I click on continue button
    And I click on just log me in radio button
    And I click on submit button1Then user shpuld be successfully logged in

[name="recoveryPhrase"]
'button*=Recover'
[id="has-verified-domain"]
id="rb_link_account_login"
'button*=Continue'

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
