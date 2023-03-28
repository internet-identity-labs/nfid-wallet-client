// Recursion with callback util
// It goes one by one in array with await
export function processArray<T>(
  array: T[],
  processElement: (element: T, done: () => void) => void,
  callback: () => void,
) {
  if (array.length > 0) {
    const currentElement = array.shift()
    if (currentElement !== undefined) {
      processElement(currentElement, () => {
        processArray(array, processElement, callback)
      })
    }
  } else {
    callback()
  }
}

export function groupArrayByField<T>(data: T[], fieldName: keyof T): T[][] {
  const groupedData: Record<string, T[]> = data.reduce(
    (acc: Record<string, T[]>, item: T) => {
      const fieldValue = item[fieldName]
      if (fieldValue == null) {
        return acc
      }
      const key = fieldValue.toString()
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(item)
      return acc
    },
    {},
  )
  return Object.values(groupedData)
}
