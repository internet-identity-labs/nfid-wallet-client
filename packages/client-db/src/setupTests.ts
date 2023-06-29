import "fake-indexeddb/auto"
import { TextEncoder, TextDecoder } from "util"
import "whatwg-fetch"

global.TextEncoder = TextEncoder
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
global.TextDecoder = TextDecoder
