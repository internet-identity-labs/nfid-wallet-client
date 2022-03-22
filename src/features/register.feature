# features/register.feature

Feature: Register to NFID

    Feature Description
    A user has the ability to register and open an account

    Scenario: TC_00001 Register to NFID
    Given user opens website on browser
    And device is not registered
    Then user scans QR code with camera
    And user clicks "Set PA for browser button"
    When click "Set PA button" on "Register this device page"
    And fill username with "PA_1"
