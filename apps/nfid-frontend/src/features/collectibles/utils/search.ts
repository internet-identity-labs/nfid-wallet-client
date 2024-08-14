//https://gist.github.com/GlauberF/220d0cce3b24abf78e8d8611248a3bca

export class GlauberTS {
  /**
   * recursive function to be used when searching for a
   * keyword in multi-level arrays
   * ex: array.filter(VimboUtils.containsDeep('search content'))
   * @param text
   */
  public static containsDeep =
    (text: string) =>
    (value?: any): any => {
      if (!value) {
        return false
      }

      const valueType = typeof value

      if (valueType === "string") {
        return value.toLowerCase().indexOf(text.toLowerCase()) > -1
      }
      if (Array.isArray(value)) {
        return value.some(GlauberTS.containsDeep(text))
      }
      if (valueType === "object") {
        return Object.values(value).some(GlauberTS.containsDeep(text))
      }
      return false

      // tslint:disable-next-line
    }

  /**
   * Deep search on an array that can have one or more levels
   * @param array
   * @param text
   * @param field
   */
  public static searchDeepInArray(
    array: Array<any>,
    text: string,
    field: string,
  ): any {
    if (!array || !text) {
      return null
    }

    return array.filter(this.containsDeep(text)).map((element) => {
      const idx = Object.keys(element).length ? Object.keys(element)[0] : null

      if (!idx) {
        return element
      }

      return Object.assign({}, element, {
        [idx]: element[idx].filter(
          (subElement: any) =>
            subElement[field].toLowerCase().indexOf(text.toLowerCase()) > -1,
        ),
      })
    })
  }
}

// Example
// https://stackblitz.com/edit/search-deep-typescript?file=index.ts
