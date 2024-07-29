import { Router } from "express";
import { AppDataSource } from "../db.config";
import { User } from "../entity/User";
import { setupTestDataSource } from "./setup";
import { it, beforeAll, afterAll, describe, expect } from "@jest/globals";
import jest from "jest";

let app: Router;

beforeAll(async () => {
  const testDataSource = await setupTestDataSource();

  console.log(testDataSource);
  
  // Create a mock repository object
  const mockRepository = {
    find: jest.fn(),
    save: jest.fn(),
    // Add other methods as needed
  };

  // Spy on the getRepository method and return the mock repository
  jest.spyOn(testDataSource, 'getRepository').mockReturnValue(mockRepository);

  // Initialize your Express app here
  app = (await import("../router/userRoutes")).default;
});

afterAll(async () => {
  const testDataSource = AppDataSource.getRepository.mock.results[0].value.manager.connection;
  await testDataSource.destroy();
});


describe("User Controller", () => {
  let userId: number;

  it("should create a new user", async () => {
    const response = await request(app)
      .post("/users")
      .send({
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        password: "password123",
      });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe("User added successfully");

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ email: "john.doe@example.com" });
    expect(user).toBeDefined();
    expect(user.email).toBe("john.doe@example.com");
    userId = user.id;
  });

  it("should get all users", async () => {
    const response = await request(app).get("/users");

    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it("should get a user by ID", async () => {
    const response = await request(app).get(`/users/${userId}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(userId);
  });

  it("should update a user", async () => {
    const response = await request(app)
      .put(`/users/${userId}`)
      .send({
        firstName: "Jane",
        lastName: "Doe",
      });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe(`User with id ${userId} updated successfully`);

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ id: userId });
    expect(user.firstName).toBe("Jane");
  });

  it("should delete a user", async () => {
    const response = await request(app).delete(`/users/${userId}`);

    expect(response.status).toBe(204);

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ id: userId });
    expect(user).toBeUndefined();
  });
});
