Feature: As a user, I can send fungible tokens

  @sendft @skip
  Scenario Outline: Send FT transaction
    Given User opens NFID site
    And User is already authenticated by <nfid number> anchor
    And Tokens displayed on user assets
    And User opens send dialog window
    When Choose <currency> on <category> from send options
    And Set amount <amount>
    And Set <address> address then send <amount> FT
    Then Transaction is success
    Examples:
      | category          | nfid number | address                                                          | amount | currency |
      | Internet Computer | 28567       | f2fcf27d5ae274bca000c90f9e9aa70e5e82fdfcdbd3377a9279e11aa1ec49ce | 0.0001 | ICP      |
      | BoomDAO           | 28567       | vso2q-ja7iv-7kzld-zje2z-2c4wd-s4tpj-hp6cv-t5srn-tknjk-ees5l-uqe  | 0.001  | BOOM     |
