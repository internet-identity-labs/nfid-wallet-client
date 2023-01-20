import { Application } from "../_ic_api/identity_manager.d"

export const ApplicationMock: Application = {
  is_nft_storage: [],
  is_trusted: [],
  is_iframe_allowed: [],
  alias: [],
  img: [],
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
