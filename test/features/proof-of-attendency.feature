@pending
Feature: Proof of attendency

  Scenario Outline: User wants to proof attendency
    Given user scans QRCode on event
    Then his device opens the default browser with the url "/poa/iiw-april-22"
    When the user is unregistered
    Then the page transitions to the url "/poa/iiw-april-22/register-account/intro"
    When the user clicks on "Create an NFID with biometric on this device"
    Then the device opens a WebAuthN challenge
    When the user accepts the challenge
    Then the device transitions to "poa/iiw-april-22/register-account/captcha"
    And displays a new captcha
    When the user enters the correct captcha and clicks "verify"
    Then the browser asks for another credential and starts loading
    And the browser transitions to "poa/iiw-april-22/register-account/copy-recovery-phrase"
    When the user clicks "Copy"
    Then the button "Continue" gets enabled
    When the user clicks "Continue"
    Then the page transitions to "/profile/authenticate"
    And the profile page displays the Achievements banner
    When the user clicks on the Achievements banner
    Then the page transitions to "/poa/iiw-april-22/award"
