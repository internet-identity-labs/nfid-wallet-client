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
  regex: /^\+[0-9 ]{4,20}$/,
  minLength: 4,
  maxLength: 20,
  errorMessages: {
    pattern: 'Phone number must start with a "+" followed by digits',
    required: "Phone number is required",
    length: "Phone number must be between 4 and 20 digits long",
  },
}

export const nameRules = {
  regex: /^[a-zA-Z0-9 ]{1,30}$/,
  minLength: 1,
  maxLength: 30,
  errorMessages: {
    pattern: "Full name must only contain letters and numbers",
    required: "Full name is required",
    length: "Full name must be between 1 and 30 characters long",
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
  regex: /^[a-zA-Z0-9]{5}$/,
  minLength: 5,
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
