/**
 * Central place auth tokens are read from and written to.
 *
 * Tokens are kept in-memory first and mirrored to sessionStorage only so a
 * same-tab reload doesn't log the user out. Unlike localStorage, sessionStorage
 * is cleared when the tab closes and isn't shared across tabs — it shrinks the
 * window an injected script (XSS) has to steal a live token, without changing
 * any request/response shape the backend sees.
 */

type TokenKind = "access_token" | "refresh_token";

const memory: Record<TokenKind, string | null> = {
  access_token: null,
  refresh_token: null,
};

function read(kind: TokenKind): string | null {
  if (memory[kind]) return memory[kind];
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(kind);
}

function write(kind: TokenKind, value: string) {
  memory[kind] = value;
  if (typeof window !== "undefined") sessionStorage.setItem(kind, value);
}

function clear(kind: TokenKind) {
  memory[kind] = null;
  if (typeof window !== "undefined") sessionStorage.removeItem(kind);
}

export const tokenStore = {
  getAccess: () => read("access_token"),
  setAccess: (token: string) => write("access_token", token),
  clearAccess: () => clear("access_token"),

  getRefresh: () => read("refresh_token"),
  setRefresh: (token: string) => write("refresh_token", token),
  clearRefresh: () => clear("refresh_token"),

  clearAll: () => {
    clear("access_token");
    clear("refresh_token");
  },
};
