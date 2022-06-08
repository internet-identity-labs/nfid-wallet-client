# features/register.feature

Feature: Register to NFID (Web)

    Feature Description
    A user has the ability to register and open an account on the web browser

    Scenario: TC_00001 Register to NFID on Web
    Given user opens website on browser
    And device is not registered
    Then user scans QR code with camera
    And user has no NFID accounts
    Then user clicks Register
    And user enters <Persona Name>
    And user creates keys with FaceId
    Then user gets generated keysCreated
    Then user can login to NFID account with registered device
    When click "Set PA button" on "Register this device page"
    And fill username with <Username>

    Examples:
        | Persona Name | Username |
        | John Doe | johnDoe |



Feature: Register to NFID (Mobile)

    Feature Description
    A user has the ability to register and open an account on a mobile

    Scenario Outline: TC_00002 Register to NFID on Mobile
    Given user opens website integrated with NFID
    And device is not registered
    Then user clicks Register
    And user inputs <phone_number>
    And user inputs SMS verification code
    And user enters <Persona Name>
    And user creates keys with FaceId
    Then user gets generated keysCreated
    Then user can login to NFID account with registered device

    Examples:
        | phone_number | Persona Name|
        | +49 1234 567 891 | John Doe |

