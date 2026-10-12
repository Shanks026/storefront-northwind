/**
 * Mock auth backed by localStorage.
 *  - users:   sf_users   → [{ id (uuid), name, email, passwordHash, createdAt }]
 *  - session: sf_session → { token (uuid), userId, createdAt }
 * DEMO ONLY: hashing in the browser with no salt is not real security.
 */
import { STORAGE_KEYS } from "@/lib/constants"
import { ApiError, request, storage, uuid } from "./client"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const MIN_PASSWORD = 6

async function hash(text) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text))
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, "0")).join("")
}

const normalizeEmail = (email) => email.trim().toLowerCase()
const readUsers = () => storage.get(STORAGE_KEYS.users, [])
const publicUser = ({ passwordHash, ...user }) => user

function startSession(userId) {
  const session = { token: uuid(), userId, createdAt: new Date().toISOString() }
  storage.set(STORAGE_KEYS.session, session)
  return session
}

/** Field-level validation shared by the API and the forms. Returns { field: message }. */
export function validateCredentials({ name, email, password }, { requireName = false } = {}) {
  const errors = {}
  if (requireName && (!name || name.trim().length < 2)) errors.name = "Enter your full name."
  if (!email || !EMAIL_RE.test(email.trim())) errors.email = "Enter a valid email address."
  if (!password || password.length < MIN_PASSWORD) errors.password = `Use at least ${MIN_PASSWORD} characters.`
  return errors
}

/** Current session with its user, or null. Clears a session whose user no longer exists. */
export function getSession() {
  return request(() => {
    const session = storage.get(STORAGE_KEYS.session)
    if (!session?.token) return null
    const user = readUsers().find((u) => u.id === session.userId)
    if (!user) {
      storage.remove(STORAGE_KEYS.session)
      return null
    }
    return { token: session.token, user: publicUser(user) }
  })
}

export function signUp({ name, email, password }) {
  return request(async () => {
    const errors = validateCredentials({ name, email, password }, { requireName: true })
    if (Object.keys(errors).length) throw Object.assign(new ApiError("Please fix the highlighted fields.", 422), { fields: errors })

    const users = readUsers()
    const normalized = normalizeEmail(email)
    if (users.some((u) => u.email === normalized)) {
      throw Object.assign(new ApiError("An account with this email already exists.", 409), {
        fields: { email: "This email is already registered. Try signing in." },
      })
    }

    const user = {
      id: uuid(),
      name: name.trim(),
      email: normalized,
      passwordHash: await hash(password),
      createdAt: new Date().toISOString(),
    }
    storage.set(STORAGE_KEYS.users, [...users, user])
    const session = startSession(user.id)
    return { token: session.token, user: publicUser(user) }
  })
}

export function signIn({ email, password }) {
  return request(async () => {
    const errors = validateCredentials({ email, password })
    if (Object.keys(errors).length) throw Object.assign(new ApiError("Please fix the highlighted fields.", 422), { fields: errors })

    const user = readUsers().find((u) => u.email === normalizeEmail(email))
    if (!user) {
      throw Object.assign(new ApiError("No account found with this email.", 401), {
        fields: { email: "No account found with this email." },
      })
    }
    if (user.passwordHash !== (await hash(password))) {
      throw Object.assign(new ApiError("Incorrect password.", 401), { fields: { password: "Incorrect password." } })
    }
    const session = startSession(user.id)
    return { token: session.token, user: publicUser(user) }
  })
}

export function signOut() {
  return request(() => {
    storage.remove(STORAGE_KEYS.session)
    return null
  })
}

/** For user-scoped mock endpoints: the signed-in user's id, or a 401 like a real API. */
export function requireUserId() {
  const session = storage.get(STORAGE_KEYS.session)
  const user = session && readUsers().find((u) => u.id === session.userId)
  if (!user) throw new ApiError("Please sign in to continue.", 401)
  return user.id
}
