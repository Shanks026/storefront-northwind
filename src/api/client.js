/**
 * Mock API plumbing. Every function in src/api resolves through `request`
 * so the UI experiences real async behaviour (loading states, races).
 * Replace the api/* function bodies with fetch() calls to go live.
 */

let latency = { min: 250, max: 650 }

/** Tune simulated latency, e.g. setApiLatency(2000) to eyeball loading states. */
export function setApiLatency(min, max = min) {
  latency = { min, max }
}

export function delay(ms = latency.min + Math.random() * (latency.max - latency.min)) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export class ApiError extends Error {
  constructor(message, status = 400) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

/** Runs `fn` after simulated network latency; deep-clones the result like JSON over the wire. */
export async function request(fn) {
  await delay()
  const result = await fn()
  return result === undefined ? undefined : structuredClone(result)
}

export const storage = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key)
      return raw === null ? fallback : JSON.parse(raw)
    } catch {
      return fallback
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // storage full or blocked: the demo keeps working in memory for this render
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(key)
    } catch {
      // ignore
    }
  },
}

export function uuid() {
  return crypto.randomUUID()
}
