import * as fs from "fs"
import * as path from "path"

export function readFile(filename: string): any {
  try {
    return JSON.parse(fs.readFileSync(path.join(__dirname, filename), "utf8"))
  } catch (err) {
    throw new Error(`cannot read file: ${err}`)
  }
}
