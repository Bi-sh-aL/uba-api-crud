import Joi from "joi";

const nameRegex = /^[a-zA-Z]+$/;
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-/={}|;':",.<>?]).{8,20}$/;


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
  })
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
  })
});

export {createUserSchema, updateUserSchema};
