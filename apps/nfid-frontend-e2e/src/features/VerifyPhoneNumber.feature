# @registration @phone @verify-phone-number @only_deploy_to_main
# Feature: User wants to veirfy his phone number

#   Background: Open the link and ensure userE2E and user by test phone number are deleted
#     Given I remove the e2e@identitylabs.ooo
#     Given I remove the account by phone number 380990374146

#   Scenario Outline: User wants to veirfy his phone number
#     Given User opens NFID site
#     Given authstate is cleared
#     Given User authenticates with google account
#     And User enters a captcha
#     And It log's me in
#     And Tokens displayed on user assets
#     And User opens Credentials
#     And User connects mobile number
#     And User inputs a phone number +3
#     And Phone number error appears "Phone number must be between 4 and 20 digits long"
#     And User inputs a phone number +38099
#     And Phone number error appears "Not a recognized carrier phone number."
#     And User inputs a phone number +14085550101
#     And Phone number error appears "Please use a mobile phone number."
#     And User inputs a phone number +46731297658
#     And Phone number error appears "This phone number cannot be accepted."
#     And User inputs a phone number +380
#     And Phone number error appears "Phone number must start with a '+' followed by digits"
#     And User inputs a phone number +380990374146
#     And User enters pincode "00000"
#     And User enters pincode "0"
#     And User enters pincode "000000"
#     And Pin code error message appears "Incorrect verification code, please try again."
#     And User enters pincode "1"
#     Then Phone number is +380990374146

