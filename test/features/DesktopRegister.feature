@homePage @smoke @regression
Feature: Register a new NFID device
  To check the ability to register a new device

  Background: Background name
    Given I open the site "/"

  @uat
  @mission
  Scenario Outline: User registers a new device with
    When I click on the link "<link>"
    Then I expect that element "<element>" becomes displayed
    When I click on the element QR code attribute on the homePage "<qrcode>"
    Then I expect the url to contain "/register-account/intro" on a new register page
    When I click on the button "<create_nfid_button>" to create or register a new NFID account
    When I add a virtual key
    When I pause for 80000ms
    Then I expect the url to contain "/register-account/captcha"
    Then I expect that element "<captcha_input_element>" becomes displayed


    Examples:
      | link               | element                                                                      | create_nfid_button | captcha_input_element                              | captcha_button_element | qrcode                                     |
      | The Identity Layer | #home > div:nth-child(1) > div.sticky.z-30.sm\:mt-40.top-28 > div > div > h1 | .btn               | .col-span-12 > div > .rounded-md > .flex > .flex-1 | .btn-text              | //section[@id='home']/div[2]/div/div/a/div |
