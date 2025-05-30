Feature: Staking
  As a user, I want to stake tokens

  @skip @staking
  Scenario: User stakes it's tokens
    Given User opens NFID site
    And User is already authenticated by 10271 anchor
    And Verifying that tokens are displayed on assets tab
    And System saves current USD price of $NFIDW token
    And User goes to Staking tab
    And System saves current user's total staking values and staked $NFIDW token values
    And User opens Stake dialog window
    And User sets the source token to $NFIDW
    And User sets amount to Stake to 5
    And User sets the Lock Time to 2 months
    And User clicks the Stake tokens button
    Then Verifying that the Stake transaction is success
    Then User verifies total staking balances and staked $NFIDW token balances are changed correctly
