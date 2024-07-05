import { describe, it, expect } from "@jest/globals";
import { createUserSchema, updateUserSchema } from "../validator/userValidator.ts";

describe("Validation Schemas", () => {
  describe("createUserSchema", () => {
    it("should validate a correct user input", () => {
      const validUser = {
        firstName: "Alice",
        lastName: "Smith",
        email: "alice@example.com",
        password: "Password123!",
      };
      const { error } = createUserSchema.validate(validUser);
      expect(error).toBeUndefined();
    });

    it("should invalidate a user with missing required fields", () => {
      const invalidUser = {
        firstName: "Alice",
        lastName: "Smith",
        // Missing email and password
      };
      const { error } = createUserSchema.validate(invalidUser);
      expect(error).toBeDefined();
    });

    it("should invalidate a user with an invalid email", () => {
      const invalidUser = {
        firstName: "Alice",
        lastName: "Smith",
        email: "alice@example",
        password: "Password123!",
      };
      const { error } = createUserSchema.validate(invalidUser);
      expect(error).toBeDefined();
    });

    it("should invalidate a user with an invalid password", () => {
      const invalidUser = {
        firstName: "Alice",
        lastName: "Smith",
        email: "alice@example.com",
        password: "password", // Missing required characters
      };
      const { error } = createUserSchema.validate(invalidUser);
      expect(error).toBeDefined();
    });

    it("should invalidate a user with a short firstName", () => {
      const invalidUser = {
        firstName: "Al",
        lastName: "Smith",
        email: "alice@example.com",
        password: "Password123!",
      };
      const { error } = createUserSchema.validate(invalidUser);
      expect(error).toBeDefined();
    });

    it("should invalidate a user with a long firstName", () => {
      const invalidUser = {
        firstName: "A".repeat(51),
        lastName: "Smith",
        email: "alice@example.com",
        password: "Password123!",
      };
      const { error } = createUserSchema.validate(invalidUser);
      expect(error).toBeDefined();
    });

    // Add more test cases for other fields and boundary cases if needed
  });

  describe("updateUserSchema", () => {
    it("should validate a correct user update input", () => {
      const validUserUpdate = {
        firstName: "Alice",
        lastName: "Smith",
        email: "alice@example.com",
        password: "Password123!",
      };
      const { error } = updateUserSchema.validate(validUserUpdate);
      expect(error).toBeUndefined();
    });

    it("should invalidate a user update with an invalid email", () => {
      const invalidUserUpdate = {
        email: "alice@example",
      };
      const { error } = updateUserSchema.validate(invalidUserUpdate);
      expect(error).toBeDefined();
    });

    it("should invalidate a user update with an invalid password", () => {
      const invalidUserUpdate = {
        password: "password", // Missing required characters
      };
      const { error } = updateUserSchema.validate(invalidUserUpdate);
      expect(error).toBeDefined();
    });

    it("should invalidate a user update with a short firstName", () => {
      const invalidUserUpdate = {
        firstName: "Al",
      };
      const { error } = updateUserSchema.validate(invalidUserUpdate);
      expect(error).toBeDefined();
    });

    it("should invalidate a user update with a long firstName", () => {
      const invalidUserUpdate = {
        firstName: "A".repeat(51),
      };
      const { error } = updateUserSchema.validate(invalidUserUpdate);
      expect(error).toBeDefined();
    });

    // Add more test cases for other fields and boundary cases if needed
  });
});