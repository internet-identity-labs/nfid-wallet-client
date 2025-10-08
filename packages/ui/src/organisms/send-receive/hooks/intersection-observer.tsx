import { useEffect } from "react"

export const useIntersectionObserver = (
  refs: (HTMLElement | null)[],
  shouldObserve: boolean,
  callback: (index: number) => Promise<void>,
) => {
  useEffect(() => {
    if (!shouldObserve) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = refs.findIndex((ref) => ref === entry.target)
            if (index !== -1) {
              callback(index)
            }
          }
        })
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.1,
      },
    )

    refs.forEach((ref) => ref && observer.observe(ref))

    return () => {
      refs.forEach((ref) => ref && observer.unobserve(ref))
    }
  }, [refs, callback])
}
