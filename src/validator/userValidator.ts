import Joi from "joi";

const nameRegex = /^[a-zA-Z]+$/;
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-/={}|;':",.<>?]).{8,20}$/;
const mobileNumberRegex = /^[0-9]{10}$/;
const usernameRegex = /^[a-zA-Z0-9._]{3,30}$/;


const createUserSchema = Joi.object({
  firstName: Joi.string().min(3).max(50).regex(nameRegex).required().messages({
    "string.pattern.base": "First name must only contain alphabets."
  }),
  lastName: Joi.string().min(3).max(50).regex(nameRegex).required().messages({
    "string.pattern.base": "Last name must only contain alphabets."
  }),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(20).regex(passwordRegex).required().messages({
    "string.pattern.base": "Password must contain atleast one uppercase, one number and one special character"
  }),
  mobileNumber: Joi.string().regex(mobileNumberRegex).required().messages({
    "string.pattern.base": "Mobile number must be a 10-digit number."
  }),
  username: Joi.string().regex(usernameRegex).required().messages({
    "string.pattern.base": "Username must be alphanumeric and between 3 to 30 characters."
  }),
  role: Joi.array().items(Joi.object({id: Joi.number().required()}))
});

const updateUserSchema = Joi.object({
  firstName: Joi.string().min(3).max(50).regex(nameRegex).optional().messages({
    "string.pattern.base": "First name must only contain alphabets."
  }),
  lastName: Joi.string().min(3).max(50).regex(nameRegex).optional().messages({
    "string.pattern.base": "Last name must only contain alphabets."
  }),
  email: Joi.string().email().optional(),
  password: Joi.string().min(8).max(20).regex(passwordRegex).optional().messages({
    "string.pattern.base": "Password must contain atleast one uppercase, one number and one special character"
  }),
  mobileNumber: Joi.string().regex(mobileNumberRegex).optional().messages({
    "string.pattern.base": "Mobile number must be a 10-digit number."
  }),
  username: Joi.string().regex(usernameRegex).optional().messages({
    "string.pattern.base": "Username must be alphanumeric and between 3 to 30 characters."
  })
});

export {createUserSchema, updateUserSchema};
