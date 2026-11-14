/** Same pattern as the database check constraint. */
export const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/i;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** numeric(10,2) upper bound */
export const MAX_PRICE = 99_999_999.99;

export const LIMITS = {
  title: 100,
  description: 2000,
  name: 100,
  location: 255,
  email: 255,
  message: 1000,
} as const;
