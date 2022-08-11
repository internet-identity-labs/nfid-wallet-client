/* eslint-disable no-var, no-unused-vars, no-underscore-dangle */
import { TextEncoder, TextDecoder } from "util"
import "whatwg-fetch"

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Make a proxy of the global Jest expect function so we can test the global
// expect-webdriverio version
global._expect = global.expect
