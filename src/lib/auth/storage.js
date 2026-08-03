/**
 * Authentication token storage boundary.
 *
 * Every read, write and removal of the auth token goes through this module, for
 * two reasons:
 *
 * 1. Browser storage is allowed to fail. In private mode, a partitioned
 *    third-party context, or with a full quota, even *reading*
 *    `window.localStorage` throws — and this module is reached from a provider
 *    that wraps every route, so an escaping exception takes the whole
 *    application down. Nothing exported here throws.
 *
 * 2. Persistence is optional; the signed-in state is not. The token this page
 *    lifecycle knows about is held in memory here as well, so a visitor whose
 *    browser refuses storage can still sign in and stay signed in until they
 *    leave the page.
 *
 * Writes and removals report whether they were persisted, so callers can react
 * without catching browser exceptions themselves. A failed write is never an
 * authentication failure.
 */

const TOKEN_KEY = "token";

/**
 * What this page lifecycle knows about the token, independent of whether the
 * browser allowed it to be persisted.
 *
 * `undefined` — no explicit decision yet, so persisted storage is authoritative.
 * `null`      — an explicit sign-out: it must win even if the removal failed.
 * `string`    — an explicit sign-in: it must hold even if the write failed.
 */
let sessionToken;

/** Warn at most once per page, and never in production. Never includes a token. */
let failureReported = false;

function reportFailure(operation, error) {
  if (failureReported || process.env.NODE_ENV === "production") return;
  failureReported = true;
  console.warn(
    `[auth] Token persistence unavailable (${operation}: ${error?.name ?? "unknown error"}). ` +
      "Sign-in will work for this page but will not survive a reload."
  );
}

/**
 * The property access sits inside the try, not just the method call: a
 * restricted context throws on `window.sessionStorage` itself, before any method
 * is reached.
 */
function readFrom(areaName, operation) {
  if (typeof window === "undefined") return null; // server render — not a failure
  try {
    return window[areaName].getItem(TOKEN_KEY) || null;
  } catch (error) {
    reportFailure(operation, error);
    return null;
  }
}

function writeTo(areaName, value, operation) {
  if (typeof window === "undefined") return false;
  try {
    window[areaName].setItem(TOKEN_KEY, value);
    return true;
  } catch (error) {
    reportFailure(operation, error);
    return false;
  }
}

function removeFrom(areaName, operation) {
  if (typeof window === "undefined") return false;
  try {
    window[areaName].removeItem(TOKEN_KEY);
    return true;
  } catch (error) {
    reportFailure(operation, error);
    return false;
  }
}

/** Persisted token, preferring the remembered (long-lived) one. */
function readPersistedToken() {
  return (
    readFrom("localStorage", "read remembered token") ??
    readFrom("sessionStorage", "read session token")
  );
}

// --- change notification -----------------------------------------------------
// A plain listener set rather than a storage event: the token can change without
// storage being writable at all, and same-tab writes do not fire `storage`.

const listeners = new Set();

/** Subscribe to token changes. Returns an unsubscribe function. */
export function subscribeToken(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify() {
  for (const listener of listeners) listener();
}

// --- public token API --------------------------------------------------------

/**
 * The token the application should act on.
 *
 * An explicit sign-in or sign-out in this page lifecycle outranks storage, so
 * the UI stays consistent with the user's last action even when the browser
 * silently refused to record it. Returns a stable primitive, which is what makes
 * it safe as a `useSyncExternalStore` snapshot.
 */
export function getToken() {
  return sessionToken !== undefined ? sessionToken : readPersistedToken();
}

/**
 * Record a sign-in.
 *
 * @param {string} token
 * @param {{ remember?: boolean }} [options] `remember` persists across sessions.
 * @returns {boolean} Whether the token was persisted. `false` means the session
 *   is memory-only and will not survive a reload — not an authentication error.
 */
export function saveToken(token, { remember = false } = {}) {
  sessionToken = token;
  const persisted = remember
    ? writeTo("localStorage", token, "remember token")
    : writeTo("sessionStorage", token, "store session token");
  notify();
  return persisted;
}

/**
 * Record a sign-out.
 *
 * Both stores are cleared regardless of how the token was saved, and each is
 * guarded separately so one failing store cannot leave the other populated.
 *
 * @returns {boolean} Whether both stores were actually cleared.
 */
export function clearToken() {
  sessionToken = null;
  const clearedLocal = removeFrom("localStorage", "clear remembered token");
  const clearedSession = removeFrom("sessionStorage", "clear session token");
  notify();
  return clearedLocal && clearedSession;
}

/**
 * Reports that the client has taken over from the server markup — deliberately
 * not whether storage is healthy, so a blocked store resolves to "signed out"
 * rather than to a permanent loading state.
 */
export const isTokenReady = () => true;

/**
 * Original object surface, kept so the documented contract still holds for any
 * caller that reaches for it. `setToken` remembers, matching the localStorage
 * behaviour it always had.
 */
export const AuthStorage = {
  setToken: (token) => saveToken(token, { remember: true }),
  getToken,
  logout: clearToken,
};
