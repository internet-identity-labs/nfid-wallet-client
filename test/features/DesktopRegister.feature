@pending @homePage @smoke @regression
Feature: Desktop device user registration
  To check if user can register on NFID

  Background: The use is on mobile
    Given The user is on desktop device

  @uat
  @mission
  Scenario Outline: The user opens NFID website
    When user clicks on register
    Then the user should see something

  Scenario Outline: The user opens a third party application
    When user clicks on the qrcode
    Then the user should see something else
