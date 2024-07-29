import { DataSource } from "typeorm";
import { User } from "../entity/User";
import { Internship } from "../entity/Internship";
import jest from "jest";

export const setupTestDataSource = async () => {
  const testDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "Password@123",
    database: "uba_db",
    entities: [User, Internship],
    synchronize: true,
    logging: false,
    dropSchema: true,
  });

  await testDataSource.initialize();
  return testDataSource;
};

jest.mock("../db.config", () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));


