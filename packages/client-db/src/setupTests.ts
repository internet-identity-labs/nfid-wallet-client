import "fake-indexeddb/auto"
import { TextEncoder } from "util"
import "whatwg-fetch"

global.TextEncoder = TextEncoder
