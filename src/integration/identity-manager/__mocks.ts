import { HTTPAccountResponse } from "../_ic_api/identity_manager.did"

export async function mockExternalAccountResponse(): Promise<HTTPAccountResponse> {
  return {
    data: [
      {
        name: [],
        anchor: BigInt(10_000),
        access_points: [],
        personas: [],
        principal_id: "",
        phone_number: [],
      },
    ],
    error: [],
    status_code: 200,
  }
}
