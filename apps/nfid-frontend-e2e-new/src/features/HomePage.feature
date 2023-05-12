@smoke @regression
Feature: User navigates through Home page

  Background: Background name
    Given User opens NFID site

  Scenario Outline: User navigates sections on home page
    When I click on the link <link>
    # Then I expect that element <element> becomes displayed

    Examples:
      | link               | element         |
      | The Identity Layer | #home           |
      | Only with NFID     | #only-with-nfid |
      | Our mission        | #our-mission    |
      | FAQ                | #faq            |

# @mobile
# Scenario Outline: User navigates sections on mobile home page
#   And User opens burger menu
#   When I click on the link <link>
#   Then I expect that element <element> becomes displayed

#   Examples:
#     | link               | element         |
#     | The Identity Layer | #home           |
#     | Only with NFID     | #only-with-nfid |
#     | Our mission        | #our-mission    |
#     | FAQ                | #faq            |



