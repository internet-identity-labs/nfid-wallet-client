import { getGoogleDeviceState } from "./device-state"
import { DEVICE_DATA, PROFILE } from "./device-state.mocks"

describe("getGoogleDeviceState", () => {
  test("registered with google and has active google session", () => {
    const state = getGoogleDeviceState({
      profile: PROFILE,
      iiDevices: DEVICE_DATA,
      activeDevicePrincipalId: PROFILE.principalId,
    })
    expect(state).toEqual({
      hasRegisteredWithGoogle: true,
      isActiveGoogleSession: true,
      hasGoogleDeviceOnII: true,
    })
  })
  test("registered with google and has another active device session", () => {
    const state = getGoogleDeviceState({
      profile: PROFILE,
      iiDevices: DEVICE_DATA,
      activeDevicePrincipalId:
        "nmyu5-if2hf-urymb-4ajam-34yj3-gjy5d-cogql-pgoe5-iaczc-ml27v-hae",
    })
    expect(state).toEqual({
      hasRegisteredWithGoogle: true,
      isActiveGoogleSession: false,
      hasGoogleDeviceOnII: true,
    })
  })
  test("registered with google and has another active device session without device on II", () => {
    const [, ...DEVICE_DATA_WITHOUT_GOOGLE_DEVICE] = DEVICE_DATA
    const state = getGoogleDeviceState({
      profile: PROFILE,
      iiDevices: DEVICE_DATA_WITHOUT_GOOGLE_DEVICE,
      activeDevicePrincipalId:
        "nmyu5-if2hf-urymb-4ajam-34yj3-gjy5d-cogql-pgoe5-iaczc-ml27v-hae",
    })
    expect(state).toEqual({
      hasRegisteredWithGoogle: true,
      isActiveGoogleSession: false,
      hasGoogleDeviceOnII: false,
    })
  })
  test("registered with google has active Google session without device on II", () => {
    const [, ...DEVICE_DATA_WITHOUT_GOOGLE_DEVICE] = DEVICE_DATA
    const state = getGoogleDeviceState({
      profile: PROFILE,
      iiDevices: DEVICE_DATA_WITHOUT_GOOGLE_DEVICE,
      activeDevicePrincipalId: PROFILE.principalId,
    })
    expect(state).toEqual({
      hasRegisteredWithGoogle: true,
      isActiveGoogleSession: true,
      hasGoogleDeviceOnII: false,
    })
  })
})
