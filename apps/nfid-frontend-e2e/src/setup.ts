global.TextEncoder = TextEncoder
// @ts-ignore
global.TextDecoder = TextDecoder

// Make a proxy of the global Jest expect function so we can test the global
// expect-webdriverio version
// @ts-ignore
global._expect = global.expect

// // global.fetch = require("node-fetch")
// import fetch from "node-fetch"
// //@ts-ignore
// global.fetch = fetch
