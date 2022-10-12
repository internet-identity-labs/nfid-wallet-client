export const APP_ACC_BALANCE_SHEET = {
  label: "Internet Computer",
  token: "ICP",
  icpBalance: "1.3 ICP",
  usdBalance: "$6.50",
  applications: {
    NFID: {
      appName: "NFID",
      icpBalance: "1 ICP",
      accounts: [
        {
          accountId:
            "7d3b6612f09d9464612dae852b32b5169e4d8afb556b7921b49bd79e4b637f88",
          accountName: "account 1",
          icpBalance: "1.0 ICP",
          principalId:
            "dcxdv-zztqe-t22xz-k4jl6-j7vx5-3b3zh-z645u-mjlg6-lnerc-qaiq2-sae",
          usdBalance: "$5.00",
        },
      ],
    },
    "Application 1": {
      appName: "Application 1",
      icon: "https://i.picsum.photos/id/652/65/65.jpg?hmac=I1_RisYpAdE77zf_bRKKqMbTRgKaTkoOBiB0avFTMhk",
      icpBalance: "0.3 ICP",
      accounts: [
        {
          principalId:
            "gv5fe-6s7su-pgeqr-2wizb-t3suu-7kayl-vqxah-3yyia-ezheu-uovga-rqe",
          accountId:
            "d9197b5c40cfab4049cdae2dcccfa062d616a25ce85a189e4b6a8c610daa4bc0",
          accountName: "account 1", // NOTE: incremented by 1
          icpBalance: "0.1 ICP",
          usdBalance: "$0.50",
        },
        {
          principalId:
            "yosev-36gsi-oipnu-ayggf-4bnff-6ljlu-p3qos-xmqt7-dqmtm-i5mit-dae",
          accountId:
            "27a716d1a6fad66ddf068e3605e8280b5839e7b7e159d97295f6e1840a0a0a9a",
          accountName: "renamedAccount",
          icpBalance: "0.2 ICP",
          usdBalance: "$1.00",
        },
      ],
    },
  },
}
