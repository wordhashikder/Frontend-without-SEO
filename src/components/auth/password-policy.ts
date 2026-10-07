/**
 * Mirrors the API's password policy so people see the rule before they
 * submit. The API remains the authority and re-checks every password.
 */
export const PASSWORD_MIN_LENGTH = 10;
export const PASSWORD_MAX_LENGTH = 128;

export const PASSWORD_HINT =
  "10 to 128 characters, with at least one letter and one number.";

/** For the `pattern` attribute (browsers compile it as a Unicode regex). */
export const PASSWORD_PATTERN = `(?=.*\\p{L})(?=.*\\p{Nd}).{${PASSWORD_MIN_LENGTH},${PASSWORD_MAX_LENGTH}}`;
