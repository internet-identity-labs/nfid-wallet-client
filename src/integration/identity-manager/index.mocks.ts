import { Application } from "../_ic_api/identity_manager.did"

export const ApplicationMock: Application = {
  user_limit: 1,
  domain: "some-domain.com",
  name: "MyApp",
}
export const imReadApplicationsMock = () =>
  Promise.resolve({
    // TODO: we're no
    data: [[ApplicationMock]],
    error: [],
    status_code: 200,
  })
