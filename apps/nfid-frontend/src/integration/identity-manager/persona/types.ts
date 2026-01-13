type Anchor = string
export type RootAnchor = Anchor

/** @deprecated */
export interface NFIDPersona {
  persona_id: string
  domain: string
}

/** @deprecated */
export type Persona = NFIDPersona

/**
 * checks if given account is NFID account
 * @deprecated there are no other accounts anymore
 */
export function isNFIDPersona(persona: Persona): persona is NFIDPersona {
  return typeof persona.persona_id === "string"
}
