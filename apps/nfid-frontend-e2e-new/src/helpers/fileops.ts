import * as fs from "fs"
import * as path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)

const __dirname = path.dirname(__filename)

export function readFile(filename: string): any {
  try {
    return JSON.parse(fs.readFileSync(path.join(__dirname, filename), "utf8"))
  } catch (err) {
    throw new Error(`cannot read file: ${err}`)
  }
}
