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

export const isValidPhonenumber = (phonenumber: string) => {
  return phoneRules.regex.test(phonenumber)
}

export const isValidName = (name: string) => {
  return nameRules.regex.test(name)
}
