/**
 * @fileoverview
 * A set of helpers for response, so that we don't depend on `JSON.stringify`
 * regarding the final shape of data (so it's not accidental).
 *
 * TODO: Revisit the decision, maybe Express has some built-in formatters, so
 *  I shouldn't do it manually each time or create my own solution. xD
 */

export type CustomDate = string;

export function formatDate(value: unknown): CustomDate | null {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return null;
}

export function formatString(value: unknown): string | null {
  if (typeof value == "string") {
    return value;
  }

  return null;
}

export function formatBoolean(value: unknown): boolean {
  return Boolean(value);
}
