import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { Request, Response } from "express";
import { AppDataSource } from "../db.config";
// import { User } from "../entity/User";
// import { Role } from "../entity/Role";
import bcrypt from "bcrypt";
import { generateToken } from "../middleware/auth";
import * as userController from "../restApi/userController";

vi.mock("../db.config");
vi.mock("../entity/User");
vi.mock("../entity/Role");
vi.mock("bcrypt");
vi.mock("../middleware/auth");

describe("User Controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    req = {
      query: {}
    };
    res = {
      status:  vi.fn().mockImplementation(() => res),
      json: vi.fn(),
    };
    statusMock = res.status as jest.Mock;
    jsonMock = res.json as jest.Mock;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("getUsers", () => {
    it("should return paginated users", async () => {
      const userRepositoryMock = {
        findAndCount: vi.fn().mockResolvedValue([[{ id: 1, name: "John Doe", role: [{ name: "User" }] }], 1]),
      };
      (AppDataSource.getRepository as jest.Mock).mockReturnValue(userRepositoryMock);
      
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      req.query.page = "1";
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      req.query.limit = "5";
  
      await userController.getUsers(req as Request, res as Response);
  
      expect(statusMock).not.toHaveBeenCalled();
      expect(jsonMock).toHaveBeenCalledWith({
        data: [{ id: 1, name: "John Doe", role: [{ name: "User" }] }],
        page: 1,
        limit: 5,
        total: 1,
        totalPages: 1,
      });
    });
  
    it("should handle errors", async () => {
      const userRepositoryMock = {
        findAndCount: vi.fn().mockRejectedValue(new Error("DB Error")),
      };
      (AppDataSource.getRepository as jest.Mock).mockReturnValue(userRepositoryMock);
  
      await userController.getUsers(req as Request, res as Response);
  
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ status: "Failed to fetch users." });
    });
  });

  describe("getUserById", () => {
    it("should return a user by ID", async () => {
      const userRepositoryMock = {
        findOne: vi.fn().mockResolvedValue({ id: 1, name: "John Doe" }),
      };
      (AppDataSource.getRepository as jest.Mock).mockReturnValue(userRepositoryMock);

      req.params = { id: "1" };

      await userController.getUserById(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({ id: 1, name: "John Doe" });
    });

    it("should handle user not found", async () => {
      const userRepositoryMock = {
        findOne: vi.fn().mockResolvedValue(null),
      };
      (AppDataSource.getRepository as jest.Mock).mockReturnValue(userRepositoryMock);

      req.params = { id: "1" };

      await userController.getUserById(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ message: "404 User not found" });
    });

    it("should handle errors", async () => {
      const userRepositoryMock = {
        findOne: vi.fn().mockRejectedValue(new Error("DB Error")),
      };
      (AppDataSource.getRepository as jest.Mock).mockReturnValue(userRepositoryMock);

      req.params = { id: "1" };

      await userController.getUserById(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ status: "Failed to fetch user." });
    });
  });

  describe("createUser", () => {
    it("should create a new user", async () => {
      const userRepositoryMock = {
        findOne: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockReturnValue({ id: 1 }),
        save: vi.fn().mockResolvedValue({ id: 1 }),
      };
      const roleRepositoryMock = {
        findOne: vi.fn().mockResolvedValue({ id: 1, name: "admin" }),
      };
      (AppDataSource.getRepository as jest.Mock)
        .mockReturnValueOnce(userRepositoryMock)
        .mockReturnValueOnce(roleRepositoryMock);

      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");
      (generateToken as jest.Mock).mockReturnValue("token");

      req.body = {
        firstName: "John",
        lastName: "Doe",
        username: "johndoe",
        mobileNumber: "1234567890",
        email: "john@example.com",
        password: "password",
        role: [{ id: 1 }],
      };

      await userController.createUser(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({
        status: "User added successfully",
        token: "token",
      });
    });

    it("should handle email already exists", async () => {
      const userRepositoryMock = {
        findOne: vi.fn().mockResolvedValue({ id: 1, email: "john@example.com" }),
      };
      (AppDataSource.getRepository as jest.Mock).mockReturnValue(userRepositoryMock);

      req.body = { email: "john@example.com" };

      await userController.createUser(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(409);
      expect(jsonMock).toHaveBeenCalledWith({ status: "Email already exists." });
    });

    it("should handle username already exists", async () => {
      const userRepositoryMock = {
        findOne: vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 1, username: "johndoe" }),
        save: vi.fn()
      };
      (AppDataSource.getRepository as jest.Mock).mockReturnValue(userRepositoryMock);

      const req = {
        body: {
          email: "john@example.com", // Email that does not exist
          username: "johndoe", // This username already exists
          
        },
      } as Request;

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;

      await userController.createUser(req, res);
      expect(res.status).toHaveBeenCalledWith(409); // Expect conflict status
      expect(res.json).toHaveBeenCalledWith({ status: "Username already exists." });
    });

    it("should handle errors", async () => {
      const userRepositoryMock = {
        findOne: vi.fn().mockRejectedValue(new Error("DB Error")),
      };
      (AppDataSource.getRepository as jest.Mock).mockReturnValue(userRepositoryMock);

      req.body = { email: "john@example.com" };

      await userController.createUser(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ status: "Failed to add user." });
    });
  });

  describe("updateUser", () => {
    // it("should update an existing user", async () => {
    //   const userRepositoryMock = {
    //     findOne: vi.fn().mockResolvedValue({ id: 1, email: "john@example.com", username: "johndoe" }),
    //     findOneBy: vi.fn().mockImplementation((criteria) => {
    //       // Simulate no conflict for email or username
    //       if (criteria.email === "john.new@example.com") {
    //         return Promise.resolve(null);
    //       }
    //       if (criteria.username === "johndoe") {
    //         return Promise.resolve(null);
    //       }
    //       return Promise.resolve(null); // No existing user for other criteria
    //     }),
    //     save: vi.fn(),
    //   };
  
    //   (AppDataSource.getRepository as jest.Mock).mockReturnValue(userRepositoryMock);
    //   (bcrypt.hash as jest.Mock).mockResolvedValue("hashedNewPassword"); 
  
    //   req.params = { id: "1" };
    //   req.body = { email: "john.new@example.com" };
  
    //   await userController.updateUser(req as Request, res as Response);
  
    //   expect(statusMock).toHaveBeenCalledWith(200); // Corrected to 200 for a successful update
    //   expect(jsonMock).toHaveBeenCalledWith({ status: "User with id 1 updated successfully." });
    //   expect(userRepositoryMock.save).toHaveBeenCalled();
    // });
 

    it("should return 404 if user not found", async () => {
      const userRepositoryMock = {
        findOne: vi.fn().mockResolvedValue(null),
      };
      (AppDataSource.getRepository as jest.Mock).mockReturnValue(userRepositoryMock);

      req.params = { id: "999" };

      await userController.updateUser(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ message: "404 User not found" });
    });

    it("should handle email already exists error", async () => {
      const userRepositoryMock = {
        findOne: vi.fn().mockResolvedValue({ id: 1, email: "john@example.com" }),
        findOneBy: vi.fn().mockResolvedValue({ id: 2, email: "john.new@example.com" }),
      };
      (AppDataSource.getRepository as jest.Mock).mockReturnValue(userRepositoryMock);

      req.params = { id: "1" };
      req.body = { email: "john.new@example.com" };

      await userController.updateUser(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(409);
      expect(jsonMock).toHaveBeenCalledWith({ status: "Email already exists." });
    });

    it("should handle errors", async () => {
      const userRepositoryMock = {
        findOne: vi.fn().mockRejectedValue(new Error("DB Error")),
      };
      (AppDataSource.getRepository as jest.Mock).mockReturnValue(userRepositoryMock);

      req.params = { id: "1" };

      await userController.updateUser(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ status: "Failed to update user." });
    });
  });

  describe("deleteUser", () => {
    it("should delete an existing user", async () => {
      const userRepositoryMock = {
        findOne: vi.fn().mockResolvedValue({ id: 1, email: "john@example.com" }),
        remove: vi.fn(),
      };
      (AppDataSource.getRepository as jest.Mock).mockReturnValue(userRepositoryMock);

      req.params = { id: "1" };

      await userController.deleteUser(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(204);
      expect(jsonMock).toHaveBeenCalledWith({ status: "User with id 1 deleted successfully." });
    });

    it("should return 404 if user not found", async () => {
      const userRepositoryMock = {
        findOne: vi.fn().mockResolvedValue(null),
      };
      (AppDataSource.getRepository as jest.Mock).mockReturnValue(userRepositoryMock);

      req.params = { id: "999" };

      await userController.deleteUser(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ message: "404 User not found" });
    });

    it("should handle errors", async () => {
      const userRepositoryMock = {
        findOne: vi.fn().mockRejectedValue(new Error("DB Error")),
      };
      (AppDataSource.getRepository as jest.Mock).mockReturnValue(userRepositoryMock);

      req.params = { id: "1" };

      await userController.deleteUser(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ status: "Failed to delete user." });
    });
  });

  describe("userLogin", () => {
    it("should login user successfully", async () => {
      const userRepositoryMock = {
        findOne: vi.fn().mockResolvedValue({ id: 1, email: "john@example.com", password: "hashedPassword", role: [{name: "Admin"}]}),
      };
      (AppDataSource.getRepository as jest.Mock).mockReturnValue(userRepositoryMock);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (generateToken as jest.Mock).mockReturnValue("token");

      req.body = { email: "john@example.com", password: "password" };

      await userController.userLogin(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({ status: "Login successful", token: "token", role: "Admin" });
    });

    it("should return 401 for invalid email", async () => {
      const userRepositoryMock = {
        findOne: vi.fn().mockResolvedValue(null),
      };
      (AppDataSource.getRepository as jest.Mock).mockReturnValue(userRepositoryMock);

      req.body = { email: "wrong@example.com", password: "password" };

      await userController.userLogin(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({ status: "Invalid email or password" });
    });

    it("should return 401 for invalid password", async () => {
      const userRepositoryMock = {
        findOne: vi.fn().mockResolvedValue({ id: 1, email: "john@example.com", password: "hashedPassword" }),
      };
      (AppDataSource.getRepository as jest.Mock).mockReturnValue(userRepositoryMock);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      req.body = { email: "john@example.com", password: "wrongpassword" };

      await userController.userLogin(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({ status: "Invalid email or password" });
    });

    it("should handle errors", async () => {
      const userRepositoryMock = {
        findOne: vi.fn().mockRejectedValue(new Error("DB Error")),
      };
      (AppDataSource.getRepository as jest.Mock).mockReturnValue(userRepositoryMock);

      req.body = { email: "john@example.com", password: "password" };

      await userController.userLogin(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ status: "Failed to login" });
    });
  });
});