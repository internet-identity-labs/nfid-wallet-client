import { Account } from "../modules/account/types"

export const validateEmail = (email: string) => {
  const regex =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return regex.test(email)
}

export const validatePhonenumber = (phonenumber: string) => {
  const regex = /^\d{10}$/
  return regex.test(phonenumber)
}

export const validateName = (name: string) => {
  const regex = /^[a-zA-Z\s]*$/
  return regex.test(name)
}

export const validateUniqueName = (account: Account | null, name: string) => {
  return !account || account.name !== name
}
