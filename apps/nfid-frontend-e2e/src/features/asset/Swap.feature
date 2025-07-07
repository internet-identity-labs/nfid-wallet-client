Feature: Swap functionality
  As a user, I want to swap tokens

  @swap @desktop
  Scenario: User swaps his token
    Given User opens NFID site
    And User is already authenticated by 28567 anchor
    Then Verifying that tokens are displayed on assets tab
    When User opens Swap dialog window
    And User sets the target token to $NFIDW
    And User sets amount to Swap to 0.001
    And User clicks the Swap tokens button
    Then Verifying that the Swap transaction is success
    When User goes to Activity tab
    Then Verifying that swap transactions are stored in activity table
    When User goes to Tokens tab
    And Verifying the balance of $NFIDW token and $ICP token has changed correctly

#  @swap @mobile
  Scenario: User swaps his token
    Given User opens NFID site
    And User is already authenticated by 31870 anchor
    Then Verifying that tokens are displayed on assets tab
    When User opens Swap dialog window
    And User sets the target token to $NFIDW
    And User sets amount to Swap to 0.001
    And User clicks the Swap tokens button
    Then Verifying that the Swap transaction is success
    When User goes to Activity tab
    Then Verifying that swap transactions are stored in activity table
    When User goes to Tokens tab
    And Verifying the balance of $NFIDW token and $ICP token has changed correctly
