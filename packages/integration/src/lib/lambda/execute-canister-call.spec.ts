import {IDL} from "@dfinity/candid";
import {execute} from "./execute";
import {expect} from "@jest/globals";
import {executeCanisterCall} from "./execute-canister-call";

describe("Targets validation", () => {
  jest.setTimeout(50000)

  it("validate without params", async function () {
    const idl = {
      get_trusted_origins: IDL.Func([], [IDL.Vec(IDL.Text)], []),
    }
    const response = await execute(idl, "txkre-oyaaa-aaaap-qa3za-cai")
    expect(JSON.stringify(response)).toContain("nfid.one")
  })

  it("validate with params", async function () {
    const idl = {
      create_account: IDL.Func([IDL.Record({ anchor: IDL.Nat64 })], [IDL.Record({
        data: IDL.Opt(IDL.Record({
          name: IDL.Opt(IDL.Text),
          anchor: IDL.Nat64,
          access_points: IDL.Vec(IDL.Record({
            icon: IDL.Text,
            device_type: IDL.Variant({
              Email: IDL.Null,
              Passkey: IDL.Null,
              Recovery: IDL.Null,
              Unknown: IDL.Null,
            }),
            device: IDL.Text,
            browser: IDL.Text,
            last_used: IDL.Nat64,
            principal_id: IDL.Text,
            credential_id: IDL.Opt(IDL.Text),
          })),
          personas: IDL.Vec(IDL.Record({
            domain: IDL.Text,
            persona_name: IDL.Text,
            persona_id: IDL.Text,
          })),
          is2fa_enabled: IDL.Bool,
          wallet: IDL.Variant({ II: IDL.Null, NFID: IDL.Null }),
          principal_id: IDL.Text,
          phone_number: IDL.Opt(IDL.Text),
        })),
        error: IDL.Opt(IDL.Text),
        status_code: IDL.Nat16,
      })], []),
    }
    const param1 = { anchor: 10000 }
    const response = await executeCanisterCall(idl, "74gpt-tiaaa-aaaak-aacaa-cai", param1)
    expect((response as any).status_code).toEqual(404)
  })

})

