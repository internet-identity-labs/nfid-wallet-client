import { im, replaceActorIdentity } from "@nfid/integration"

import { passwordManager } from "./password-manager"

describe("password manager", () => {
  jest.setTimeout(80000)

  it("should register", async () => {
    const password = Math.random().toString(36).substring(7)
    const profile = await passwordManager.registerPasswordProfile(password)
    console.log(profile)
    expect(profile).toBeDefined()
    const identity = await passwordManager.signinWithPassword(password)
    await replaceActorIdentity(im, identity)
    const profile2 = await im.get_account()
    expect(profile.anchor).toEqual(Number(profile2.data[0]!.anchor))
    const tempAP = profile.accessPoints[0].principalId
    const realAP = profile2.data[0]!.access_points[0].principal_id
    expect(tempAP).not.toEqual(realAP)
    const newPassword = Math.random().toString(36).substring(7)
    await passwordManager.changePassword(password, newPassword)
    const identity2 = await passwordManager.signinWithPassword(newPassword)
    await replaceActorIdentity(im, identity2)
    const profile3 = await im.get_account()
    expect(profile.anchor).toEqual(Number(profile3.data[0]!.anchor))
    const newPrincipal = profile3.data[0]!.access_points[0].principal_id
    expect(profile3.data[0]!.access_points.length).toEqual(1)
    expect(newPrincipal).not.toEqual(realAP)
  })
})
