Feature: Swap functionality
  As a user, I want to swap tokens

  @swap
  Scenario: User swaps his token
    Given User opens NFID site
    And User is already authenticated by 28567 anchor
    Then Verifying that tokens are displayed on assets tab
    When User opens Swap dialog window
    And User sets the target token to NFIDW
    And User sets amount to swap to 0.007
    And User clicks the Swap tokens button
    Then Verifying that the swap transaction is success
    When User goes to activity tab
    Then Verifying that swap transactions are stored in activity table
    When User goes to tokens tab
    And Verifying the balance of NFIDWallet token and Internet Computer token has changed correctly
