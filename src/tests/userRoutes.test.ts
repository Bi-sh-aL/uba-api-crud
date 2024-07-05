import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import request from "supertest";
import express from "express";
import * as userController from "../restApi/userController.ts";
import fs from "fs/promises";
import { typeDefs, resolvers } from "../gqlSchema/schema";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";

const app = express();
app.use(express.json());

app.get("/users", userController.getUsers);
app.get("/users/:id", userController.getUserById);
app.post("/users", userController.createUser);
app.patch("/users/:id", userController.updateUser);
app.delete("/users/:id", userController.deleteUser);

const createTestServer = () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  return server.start().then(() => {
    app.use("/graphql", expressMiddleware(server));
    return app;
  });
};

jest.mock("fs/promises");

describe("RestApi", () => {
  let users: userController.User[];

  beforeEach(() => {
    // Reset users array and mock fs
    users = [
      {
        id: 1,
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "Password123!",
      },
      {
        id: 2,
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@example.com",
        password: "Password456!",
      },
    ];
    userController.users.splice(0, userController.users.length, ...users);
    jest.resetAllMocks();

    // Mock fs.writeFile to resolve without error
    jest.spyOn(fs, "writeFile").mockResolvedValue();
  });

  it("should return all users", async () => {
    const res = await request(app).get("/users");
    expect(res.status).toBe(200);
    expect(res.body).toEqual(users);
  });

  it("should return a user by ID", async () => {
    const res = await request(app).get("/users/1");
    expect(res.status).toBe(200);
    expect(res.body).toEqual(users[0]);
  });

  it("should return 404 for a non-existing user ID", async () => {
    const res = await request(app).get("/users/999");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: "404 User not found" });
  });

  it("should create a new user", async () => {
    const newUser = {
      firstName: "Alice",
      lastName: "Smith",
      email: "alice@example.com",
      password: "Password789!",
    };
    const res = await request(app).post("/users").send(newUser);
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ status: "User added successfully", id: 3 });
    expect(userController.users.length).toBe(3);
    expect(userController.users[2]).toMatchObject(newUser);
  });

  it("should not create a user with a duplicate email", async () => {
    const duplicateUser = {
      firstName: "Alice",
      lastName: "Smith",
      email: "john@example.com",
      password: "Password789!",
    };
    const res = await request(app).post("/users").send(duplicateUser);
    expect(res.status).toBe(409);
    expect(res.body).toEqual({ status: "Email already exists." });
  });

  it("should update an existing user", async () => {
    const updatedUser = { firstName: "Johnny" };
    const res = await request(app).patch("/users/1").send(updatedUser);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: "User with id 1 updated successfully.",
    });
    expect(userController.users[0].firstName).toBe("Johnny");
  });

  it("should not update a user with a duplicate email", async () => {
    const updatedUser = { email: "jane@example.com" };
    const res = await request(app).patch("/users/1").send(updatedUser);
    expect(res.status).toBe(409);
    expect(res.body).toEqual({ status: "Email already exists." });
  });

  it("should delete an existing user", async () => {
    const res = await request(app).delete("/users/1");
    expect(res.status).toBe(204);
    expect(userController.users.length).toBe(1);
  });

  it("should return 404 for deleting a non-existing user", async () => {
    const res = await request(app).delete("/users/999");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: "404 User not found" });
  });
});

describe("GraphQL API", () => {
  let app: express.Express;

  beforeEach(async () => {
    app = await createTestServer();
  });
  it("should return a list of users", async () => {
    const query = `
      query {
        users {
          edges {
            node {
              id
              firstName
              lastName
              email
              password
            }
          }
          pageInfo {
            endCursor
            hasNextPage
          }
        }
      }
    `;
    const res = await request(app)
      .post("/graphql")
      .send({ query });
    expect(res.body.data).toBeDefined();
    expect(res.body.data.users.edges.length).toBeGreaterThan(0);
  });

  it("should return a user by ID", async () => {
    const query = `
      query {
        user(id: "1") {
          id
          firstName
          lastName
          email
        }
      }
    `;
    const res = await request(app)
      .post("/graphql")
      .send({ query });
    expect(res.body.data).toBeDefined();
    expect(res.body.data.user).toHaveProperty("id", "1");
  });

  it("should return an error for a non-existing user ID", async () => {
    const query = `
      query {
        user(id: "999") {
          id
          firstName
          lastName
          email
          password
        }
      }
    `;
    const res = await request(app)
      .post("/graphql")
      .send({ query });
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].message).toBe("User not found");
  });

  it("should handle pagination correctly", async () => {
    const query = `
      query {
        users(first: 1) {
          edges {
            node {
              id
              firstName
              lastName
              email
              password
            }
          }
          pageInfo {
            endCursor
            hasNextPage
          }
        }
      }
    `;
    const res = await request(app)
      .post("/graphql")
      .send({ query });
    expect(res.body.data).toBeDefined();
    expect(res.body.data.users.edges.length).toBe(1);
    expect(res.body.data.users.pageInfo).toHaveProperty("endCursor");
    expect(res.body.data.users.pageInfo.hasNextPage).toBe(true);
  });
});
