const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^(?=.{3,30}$)[a-zA-Z0-9](?:[a-zA-Z0-9._-]*[a-zA-Z0-9])?$/;

export function isEmail(value) {
  return EMAIL_REGEX.test(value.trim());
}

export function isUsername(value) {
  return USERNAME_REGEX.test(value.trim());
}

export function validateLoginIdentity(value) {
  const identity = value.trim();
  if (!identity) {
    return "Username or email is required .";
  }

  if (identity.includes("@")) {
    return isEmail(identity) ? "" : "Please enter a valid email address.";
  }

  return isUsername(identity)
    ? ""
    : "Username must be 3-30 characters  and only letters, numbers, dot, underscore or hyphen is allowed.";
}

export function validateEmail(value) {
  const email = value.trim();
  if (!email) {
    return "Email is required.";
  }
  return isEmail(email) ? "" : "Please enter a valid email address.";
}

export function validateUsername(value) {
  const username = value.trim();
  if (!username) {
    return "Username is required.";
  }
  return isUsername(username)
    ? ""
    : "Username must be 3-30 characters  and only letters, numbers, dot, underscore or hyphen is allowed.";
}

