import "reflect-metadata";
import { AppDataSource } from "../db.config";
import { beforeAll, afterAll } from "vitest";

beforeAll(async () => {
  await AppDataSource.initialize();
});

afterAll(async () => {
  await AppDataSource.destroy();
});
