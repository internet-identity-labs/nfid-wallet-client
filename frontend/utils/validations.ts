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
  regex: /^\+[1-9]\d{4,15}$/,
  minLength: 5,
  maxLength: 15,
  errorMessages: {
    pattern: 'Phonenumber must start with a "+" followed by digits (max 15)',
    required: "Phonenumber is required",
    length: "Phonenumber should be within 15 characters long",
  },
}

export const nameRules = {
  regex: /^[a-zA-Z0-9]{5,15}$/,
  minLength: 5,
  maxLength: 15,
  errorMessages: {
    pattern: "Name must only contain letters and numbers (5-15 characters)",
    required: "Full name is required",
    length: "Full name must be between 5 and 15 characters long",
  },
}

export const tokenRules = {
  regex: /^[0-9]{6}$/,
  minLength: 6,
  errorMessages: {
    pattern: "Token must only contain numbers (6 digits)",
    required: "Token is required",
    length: "Token must be 6 digits long",
  },
}

export const captchaRules = {
  regex: /^[a-zA-Z0-9]{5}$/,
  minLength: 5,
  maxLength: 5,
  errorMessages: {
    pattern: "Captcha must only contain letters and numbers (5 characters)",
    required: "Captcha is required",
    length: "Captcha must be 5 characters long",
  },
}

export const anchorRules = {
  regex: /^[0-9]{5,}$/,
  minLength: 5,
  errorMessages: {
    pattern: "Anchor must only contain numbers (5 or more digits)",
    required: "Anchor is required",
    length: "Anchor must be 5 or more digits long",
  },
}

export const isValidPhonenumber = (phonenumber: string) => {
  return phoneRules.regex.test(phonenumber)
}

export const isValidName = (name: string) => {
  return nameRules.regex.test(name)
}

export const isValidToken = (token: string) => {
  return tokenRules.regex.test(token)
}

export const isValidCaptcha = (captcha: string) => {
  return captchaRules.regex.test(captcha)
}

export const isValidAnchor = (anchor: string) => {
  return anchorRules.regex.test(anchor)
}
