@demoApp @skip
Feature: User should be able to register and authenticate to demoApp through iFrame
  Scenario Outline: User authenticates to NFID demoApp (iFrame)
    Given User opens the demoApp /authentication-iframe
    When User authenticates to demoApp with google account
    Then Principal in demoApp is <principal>
    Examples:
      | principal                                                       |
      | zoc22-sg6yj-d4wyw-ufxfm-rcwuq-3sguk-hjhk5-dcgov-rdyza-rymus-mae |
