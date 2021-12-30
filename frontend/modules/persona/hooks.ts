import CryptoJS from "crypto-js"
import { CONFIG } from "frontend/config"
import produce from "immer"
import React from "react"
import { PERSONA_LOCAL_STORAGE_KEY } from "./constants"
import { Persona } from "./types"

export const usePersona = () => {
  const [persona, setPersona] = React.useState<Persona | null>(null)

  React.useEffect(() => {
    persona &&
      localStorage.setItem(PERSONA_LOCAL_STORAGE_KEY, JSON.stringify(persona))
  }, [persona])

  const getPersona = React.useCallback(async () => {
    const personaFromLS = localStorage.getItem(PERSONA_LOCAL_STORAGE_KEY)
    const persona: Persona = personaFromLS ? JSON.parse(personaFromLS) : null
    return new Promise<Persona | null>((resolve) => resolve(persona))
  }, [])

  const updatePersona = React.useCallback(
    (partialPersona: Partial<Persona>) => {
      const newPersona = produce(persona, (draft: Persona) => ({
        ...draft,
        ...partialPersona,
      }))
      setPersona(newPersona)
    },
    [persona],
  )

  const createPersona = React.useCallback(async (persona: Persona) => {
    const newPersona = produce(persona, (draft: Persona) => ({
      ...draft,
    }))

    try {
      const secret = CONFIG.ENCRYPTION_SECRET as string
      if (!secret) throw new Error("ENCRYPTION_SECRET is not defined")

      const encryptedPersona = CryptoJS.AES.encrypt(
        JSON.stringify(newPersona),
        CONFIG.ENCRYPTION_SECRET as string,
      ).toString()

      const response = await fetch(`${CONFIG.API.CREATE_PERSONA}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          encryptedPersona,
          principal_id: newPersona.principalId,
        }),
      }).then((res) => res.json())

      return new Promise((resolve, reject) => {
        response.error && reject(response.error)
        resolve(response.data)
      })
    } catch (error) {
      console.error(error)
    }

    return newPersona
  }, [])

  React.useEffect(() => {
    getPersona().then((persona) => setPersona(persona))
  }, [getPersona])

  return { persona, getPersona, updatePersona, createPersona }
}
