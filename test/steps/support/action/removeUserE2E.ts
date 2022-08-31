/**
 * Remove user E2E.
 */
export default async () => {
  let env = process.env.BACKEND_MODE;
  if(env === "DEV") {
    await fetch("https://ia15v0pzlb.execute-api.us-east-1.amazonaws.com/dev/userE2E", { method: "DELETE", body: "{}"})
  } else {
    throw Error(`${env} is not supported.`);
  }
}
