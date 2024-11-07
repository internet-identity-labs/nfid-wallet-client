import { useEffect, useRef, useCallback } from "react"

import { trimConcat } from "frontend/ui/atoms/util/util"

const INITED_TOKENS_LIMIT = 6
const SELECTOR = ".token-item"

export const useIntersectionObserver = (
  items: string[],
  onAction: (lastVisibleIndex: number) => Promise<void>,
) => {
  const observer = useRef<IntersectionObserver | null>(null)
  const initializedIndexes = useRef<Set<number>>(new Set())

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const pendingEntries = observer.current?.takeRecords() || []
      const allEntries = [...entries, ...pendingEntries]

      const intersectingIndexes = allEntries
        .filter((entry) => entry.isIntersecting)
        .map((entry) => {
          const itemId = entry.target.id.replace("choose_option_", "")
          return items.findIndex((item) => trimConcat("", item) === itemId)
        })
        .filter((index) => !initializedIndexes.current.has(index))

      const lastVisibleIndex = Math.max(-1, ...intersectingIndexes)

      if (lastVisibleIndex > INITED_TOKENS_LIMIT) {
        intersectingIndexes.forEach((index) =>
          initializedIndexes.current.add(index),
        )
        onAction(lastVisibleIndex)
      }
    },
    [items, onAction],
  )

  useEffect(() => {
    if (observer.current) observer.current.disconnect()

    observer.current = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    })

    const elements = document.querySelectorAll(SELECTOR)
    elements.forEach((el) => observer.current?.observe(el))

    return () => {
      elements.forEach((el) => observer.current?.unobserve(el))
      observer.current?.disconnect()
    }
  }, [handleIntersection])
}
