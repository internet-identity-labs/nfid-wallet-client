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
