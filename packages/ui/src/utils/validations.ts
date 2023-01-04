interface IValidationRules {
  regex: RegExp
  minLength: number
  maxLength: number
  errorMessages: {
    pattern: string
    required: string
    length: string
  }
}

export const phoneRules: IValidationRules = {
  regex: /^\+[0-9 ]{4,14}$/,
  minLength: 4,
  maxLength: 20,
  errorMessages: {
    pattern: `Phone number must start with a '+' followed by digits`,
    required: "Phone number is required",
    length: "Phone number must be between 4 and 20 digits long",
  },
}

export const tokenRules = {
  regex: /^[0-9]{6}$/,
  minLength: 6,
  errorMessages: {
    pattern: "Token must only contain numbers",
    required: "Token is required",
    length: "Token must be 6 digits long",
  },
}

export const captchaRules = {
  regex: /^[a-zA-Z0-9].*$/,
  minLength: 0,
  maxLength: 5,
  errorMessages: {
    pattern: "Captcha must only contain letters and numbers",
    required: "Captcha is required",
    length: "Captcha must be 5 characters long",
  },
}

export const anchorRules = {
  regex: /^[0-9]{5,}$/,
  minLength: 5,
  errorMessages: {
    pattern: "Anchor must only contain numbers",
    required: "Anchor is required",
    length: "Anchor must be 5 or more digits long",
  },
}

export const sumRules = {
  regex: /^[0-9]$/,
  minLength: 1,
  errorMessages: {
    pattern: "Sum must only contain numbers",
    required: "This field cannot be empty",
    length: "Sum must be 1 or more digits long",
  },
}

export const vaultRules = {
  minLength: 2,
  errorMessages: {
    pattern: "Vault name must only contain numbers",
    required: "This field cannot be empty",
    length: "Vault name must be 2 or more characters long",
  },
}

export const isValidToken = (token: string) => {
  return tokenRules.regex.test(token)
}
