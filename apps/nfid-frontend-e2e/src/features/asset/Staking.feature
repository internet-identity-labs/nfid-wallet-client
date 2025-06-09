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
    And User goes to details of the staked token with name $NFIDW
    And System saves current user's staking values of the $NFIDW token
    And User opens Stake dialog window
    And User sets the source token to $NFIDW
    And User sets amount to Stake to 5
    And User sets the Lock Time to 1 month
    And User clicks the Stake tokens button
    Then Verifying that the Stake transaction is success
    And User verifies total staking balances and staked $NFIDW token balances were changed correctly
    When User goes to details of the staked token with name $NFIDW
    Then User verifies user's staking values of the $NFIDW token were changed correctly on details page
    And User verifies values are correct in the first transaction of $NFIDW in Locked table
    When User click on the first row of the Locked table
    Then User verifies details of the Locked staking transaction are correct on the side bar
    When User click the Start unlocking button
    Then User verifies that the staking transaction is moved to the Unlocking table
    When User click on the first row of the Unlocking table
    Then User verifies details of the Unlocking staking transaction are correct on the side bar
    When User click the Stop unlocking button
    Then User verifies that the staking transaction is moved to the Locked table
