// ignore the horrible types in the js below, i just wanted the d.ts and the js in the same file :^)
type commonErrors =
  | "Unknown Message"
  | "Missing Access"
  | "Missing Permissions"
  | "Unknown Channel"
  | "Unknown User"
  | "Unknown Member"
  | "Unknown" // shortcut for all

declare global {
  type Optional<T> = { [P in keyof T]?: T[P] }

  /**
   * Async setTimeout. You can invert the parameters to run like setTimeout
   * @param {number} [ms=1000] The amount of time to wait.
   * @param {Function} [fn=null] The function to call after waiting.
   * @param {...*} a Args to pass into the function
   */
  function waitTimeout(ms: number): Promise<void>
  function waitTimeout<A, V>(ms: number, fn: (...args: A[]) => V, ...a: A[]): Promise<V>
  function waitTimeout<A, V>(fn: (...args: A[]) => V, ms: number, ...a: A[]): Promise<V>

  interface Number {
    // B)
    [Symbol.iterator](): IterableIterator<number>
    toCurrency(currency?: "USD" | "CAD" | "GBP" | "EUR"): string
  }

  interface Array<T> {
    /**
     * Get a random element from this array.
     */
    random(): T
    random(n: 1): T
    /**
     * Get 2 random elements from this array.
     */
    random(n: 2): [T, T]
    /**
     * Get random elements from this array.
     */
    random(n: number): T[]

    /**
     * Get the first element from this array.
     */
    first(): this[0]
    /**
     * Get the first elements from this array.
     */
    first(n: number): T[]

    /**
     * Get the last elements from this array.
     */
    last(): T
    /**
     * Get the last element from this array.
     */
    last(n: number): T[]

    /**
     * Clone this array.
     */
    clone(): T[]

    /**
     * Remove values from the array, and returns a new copy.
     * @param v Values to remove from the array. If none is specified, all `undefined`s are removed.
     */
    trim(...v: T[]): T[]

    /**
     * Remove values from the array, mutating the array.
     * @param v Values to remove from the array. If none is specified, all `undefined`s are removed.
     */
    remove(...v: T[]): this

    /**
     * Shuffle the values in this array.
     */
    shuffle(): this

    /**
     * Map an array with async functions and resolve all the promises.
     * @param {Function} fn Function to run on all elements in the array.
     * @param {*} [thisArg] Value to use as `this` when executing function
     */
    asyncMap<V>(fn: (v: T, i: number, array: this) => Promise<V>): Promise<V[]>
    asyncMap<This, V>(fn: (this: This, v: T, i: number, array: this) => Promise<V>, thisArg: This): Promise<V[]>
  }

  interface String {
    /**
     * Strip indents from the start of each line in a string.
     * @param tabSize Optional tab size to remove from the start of each line.
     */
    stripIndents(tabSize?: number): string

    /**
     * Conver the string into Proper Case.
     * @param all Whether or not to change all words to proper case, or just the start of the string.
     */
    toProperCase(all: boolean): string

    /**
     * Get words from a string.
     */
    words(): string[]

    /**
     * Pads the current string with a given string (possibly repeated)
     * so that the resulting string reaches a given length.
     * The padding is applied on both sides of the current string.
     * @param maxLength The length of the resulting string once the current string has been padded.
     * @param fillString The string to pad the current string with. Defaults to `" "`
     */
    pad(maxLength: number, fillString?: string): string
  }

  interface Promise<T> {
    /**
     * Sets a defualt value, returned when this promise rejects, or returns nothing.
     * @param v The default value
     */
    default(): this
    default(v: null): this
    default<V>(v: V): this | V
    /**
     * Silences the rejection of a promise, and optionally returns a default value instead.
     * @param v The default value
     */
    silence(): this
    silence(v: null): this
    silence<V>(v: V): this | V
    /**
     * Returns a value, regardless of whether or not the promise rejects.
     * @param v The value to return
     */
    return(): void
    return(v: null): void
    return<V>(v: V): V

    /**
     * Catch specific errors and throw the rest.
     * @param filter The filter to use to find errors to catch.
     * @param handler The handler used to handle these errors.
     */
    catchErrors<V>(filter: string | string[] | RegExp, handler: (e: Error) => V): this | V
    catchErrors<V>(filter: commonErrors | commonErrors[] | RegExp, handler: (e: Error) => V): this | V

    /**
     * Catch and silence specific errors and throw the rest.
     * @param filter The filter to use to find errors to catch.
     * @param value The value to return if an error is caught
     */
    silenceErrors(filter: string | string[] | RegExp): this
    silenceErrors(filter: string | string[] | RegExp, value: null): this
    silenceErrors<V>(filter: string | string[] | RegExp, value: V): this | V
    silenceErrors(filter: commonErrors | commonErrors[] | RegExp): this
    silenceErrors(filter: commonErrors | commonErrors[] | RegExp, value: null): this
    silenceErrors<V>(filter: commonErrors | commonErrors[] | RegExp, value: V): this | V
  }
}


(globalThis as any).waitTimeout = function <A, V>(ms: number = 1000, fn: (...args: A[]) => V, ...args: A[]): Promise<V> {
  if (typeof fn === "number" && typeof ms === "function") [ms, fn] = [fn, ms]
  return new Promise(resolve => {
    setTimeout(typeof fn === "function" ? () => resolve(fn(...args)) : resolve, ms, ...args)
  })
}

Object.defineProperty(Function.prototype, "header", {
  get: function () {
    const d = this.toString()
      .split(/\s+/)
      .join(" ")
      .match(/^(async)? *(function)? *(\w+)? *\((.+?)\) *(?:=>|{)/)
    return `${d[1] ? `${d[1]} ` : ""}${d[2] ? `${d[2]} ` : ""}${d[3] || ""}(${d[4]?.trim() || ""})`
  },
  configurable: true,
})

Object.defineProperties(Number.prototype, {
  [Symbol.iterator]: {
    value: function* () {
      if (!isFinite(this) || isNaN(this)) throw new TypeError(`${this} is not iterable`)

      const f = (i: number) => (this > 0 ? i < this : i > this)
      for (let i = 0; f(i); this > 0 ? i++ : i--) yield i
    },
    writable: true,
    configurable: true,
  },
  toCurrency: {
    value: function (locale: string = "USD") {
      return this.toLocaleString("en-US", { style: "currency", currency: locale })
    }
  }
})

Object.defineProperty(process.hrtime, "format", {
  value: function (hrtime: NodeJS.HRTime) {
    if (!Array.isArray(hrtime)) return ""
    return `${hrtime[0] > 0 ? `${hrtime[0]}s ` : ""}${hrtime[1] / 1000000}ms`
  },
  writable: true,
  configurable: true,
})

// const { words } = require("lodash")
Object.defineProperties(String.prototype, {
  stripIndents: {
    value: function (tabSize: number | undefined) {
      if (!tabSize || typeof tabSize !== "number" || tabSize < 1) return this.trim().replace(/^[\t ]+/gm, "")
      return this.trim().replace(new RegExp(`^[\\t ]{0,${tabSize}}`, "gm"), "")
    },
    writable: true,
    configurable: true,
  },
  toProperCase: {
    value: function (this: string, all = false) {
      return this.words()
        .map((str, i) => ((i && all) || !i ? str[0].toUpperCase() + str.slice(1).toLowerCase() : str.toLowerCase()))
        .join(" ")
    },
    writable: true,
    configurable: true,
  },
  words: {
    value: function () {
      // return words(this, pattern)
      return this.split(/[\s]+/)
    },
    writable: true,
    configurable: true,
  },
  pad: {
    value: function (maxLength: number, fillString = " ") {
      let space = (maxLength - this.length) / 2
      if (space <= 0) return this.valueOf()
      space = Math.floor(space)
      return this.padStart(space + this.length, fillString).padEnd(maxLength, fillString)
    },
    writable: true,
    configurable: true,
  },
})

Object.defineProperties(Promise.prototype, {
  default: {
    value: function (val: any) {
      return this.catch(() => val).then((v: any) => v ?? val) // if a resolved promise returns undefined
    },
    writable: true,
    configurable: true,
  },
  silence: {
    value: function (val: any) {
      // i actually shouldnt be disregarding all errors lol i should be trying to fix them
      return this.catch((err: Error) => (console.error("Silenced Error:", err?.stack || err) as unknown) || val)
    },
    writable: true,
    configurable: true,
  },
  return: {
    value: function (val: any) {
      return this.then(() => val).catch(() => val)
    },
    writable: true,
    configurable: true,
  },
  catchErrors: {
    value: function (filter: any, handler: (error: Error) => void) {
      if (typeof handler !== "function") return this
      if (typeof filter !== "string" && !Array.isArray(filter) && !(filter instanceof RegExp))
        return this.catch(handler)
      filter = filter as any
      return this.catch((e: Error) => {
        const m = Array.isArray(filter) || typeof filter === "string" ? "includes" : "test"
        if (filter[m](e) || filter[m](e?.message ?? e) || filter[m](e?.name ?? e)) return handler(e)
        throw e
      })
    },
    writable: true,
    configurable: true,
  },
  silenceErrors: {
    value: function (filter: any, value: any) {
      return this.catchErrors(filter, () => value)
    },
    writable: true,
    configurable: true,
  },
})

Object.defineProperties(Array.prototype, {
  first: {
    value: function (amount: number) {
      return !isNaN(amount) && amount > 0 ? this.slice(0, amount) : this[0]
    },
    writable: true,
    configurable: true,
  },
  last: {
    value: function (amount: number) {
      return !isNaN(amount) && amount > 0 ? this.slice(this.length - amount) : this[this.length - 1]
    },
    writable: true,
    configurable: true,
  },
  random: {
    value: function (times = 1) {
      if (!this.length) return times === 1 ? undefined : []
      if (times === 1) {
        return this[Math.floor(Math.random() * this.length)]
      } else {
        const returnArray: any[] = []
        if (isNaN(times)) return returnArray
        for (const i of +times) {
          returnArray.push(this[Math.floor(Math.random() * this.length)])
        }
        return returnArray
      }
    },
    writable: true,
    configurable: true,
  },
  clone: {
    value: function () {
      return this.slice()
    },
    writable: true,
    configurable: true,
  },
  trim: {
    value: function (...values: any[]) {
      if (values.length === 0) values.length = 1
      return this.filter((el: any) => !values.includes(el))
    },
    writable: true,
    configurable: true,
  },
  remove: {
    value: function (...values: any[]) {
      if (values.length > 1) {
        for (const val of values) this.remove(val)
        return this
      }

      const [val] = values
      if (this.includes(val)) {
        let i = this.length
        while (i--) if (Object.is(this[i], val)) this.splice(i, 1)
      }

      return this
    },
    writable: true,
    configurable: true,
  },
  shuffle: {
    value: function () {
      let l = this.length, t, i
      while (l) {
        i = Math.floor(Math.random() * l--)
        t = this[l]
        this[l] = this[i]
        this[i] = t
      }
      return this
    },
    writable: true,
    configurable: true,
  },
  asyncMap: {
    value: function (func: () => void, thisArg: any) {
      return Promise.all(this.map(func, thisArg))
    },
    writable: true,
    configurable: true,
  },
})

/**
 * Give a number significant digits.
 * @param {number} number The number to transform. e.g 3482
 * @param {number} digits The amount of significant digits the number should have. e.g 1
 * @returns {number} The number with digits amount of significant digits. e.g 3000
 */
// might remove this soon
;(Math as any).significant = (number: number, digits: number) => {
  if (isNaN(number)) throw new TypeError("No number was specified.")
  if (isNaN(digits)) throw new TypeError("Second parameter needs to be a number.")
  number = Number(number)
  digits = Number(digits)

  if (number.toString().includes(".") && number.toString().split(".")[1].length >= digits) return number.toFixed(digits)
  let times = number.toString().split(".")[0].length - digits
  return Math.round(number / 10 ** times) * 10 ** times || 0
}

export {}