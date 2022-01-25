type PersonaName = string
type Anchor = string
export type RootAnchor = Anchor

export interface Persona {
  name: PersonaName
  isRoot: boolean
  isSeedPhraseCopied: boolean
  isIIAnchor: boolean
  anchor: Anchor
}
