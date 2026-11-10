Feature: Tokens tab
  As a user, I want to see fungible assets in profile and manage them

  @assets @desktop
  Scenario Outline: User checks his tokens are displayed and checks the ability to manage his tokens
    Given User opens NFID site
    And User is already authenticated by <nfid number> anchor
    Then Verifying that tokens are displayed on assets tab
    And Verifying that there is <token1> token with <stake> stake, currency <currency> on category <category>, token balance <token balance> and USD balance is not 0
    And User sets the token <token2> to be displayed if needed
    And Verifying that the <token2> token is displayed
    When User opens Token options dialog window of <token2>
    And User clicks the Hide token option button
    Then Verifying that the <token2> token is not displayed
    And User opens Manage tokens dialog window
    And User filters tokens by <token2>
    And User clicks the ShowHide button of <token2> token
    Then Verifying that the <token2> token is displayed
    Examples:
      | category | currency | nfid number | token1            | stake     | token2 | token balance |
      | Native   | ICP      | 200000102   | Internet Computer | available | ckPEPE | 0.01 ICP      |
      | Native   | ICP      | 200000099   | Internet Computer | available | ckPEPE | 0.2194 ICP    |

  @assets @mobile
  Scenario Outline: User checks his tokens are displayed and checks the ability to manage his tokens
    Given User opens NFID site
    And User is already authenticated by <nfid number> anchor
    Then Verifying that tokens are displayed on assets tab
    And Verifying that there is <token1> token with <stake> stake, currency <currency> on category <category>, token balance <token balance> and USD balance is not 0
    And User sets the token <token2> to be displayed if needed
    And Verifying that the <token2> token is displayed
    When User opens Token options dialog window of <token2>
    And User clicks the Hide token option button
    Then Verifying that the <token2> token is not displayed
    And User opens Manage tokens dialog window
    And User filters tokens by <token2>
    And User clicks the ShowHide button of <token2> token
    Then Verifying that the <token2> token is displayed
    Examples:
      | category | currency | nfid number | token1            | stake     | token2 | token balance |
      | Native   | ICP      | 200000100   | Internet Computer | available | ckPEPE | 0.05 ICP      |
