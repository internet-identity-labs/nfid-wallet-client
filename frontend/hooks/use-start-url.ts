import { atom, useAtom } from "jotai"

export const startUrlAtom = atom<string | undefined>(window.location.pathname)

export const useStartUrl = () => {
  const [startUrl] = useAtom(startUrlAtom)

  return startUrl
}
