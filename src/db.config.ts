import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { Internship } from "./entity/Internship";
import { Role } from "./entity/Role";
import { Permission } from "./entity/Permission";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: "root",
  password: "Password@123",
  database: "uba_db",
  entities: [User, Internship, Role, Permission],
  migrationsTableName: "custom_migration_table",
  migrations: ["src/migration/*.ts"],
  synchronize: true,
  logging: true,
  
});



AppDataSource.initialize()
  .then(() => {
    console.log("Database connected successfully.");
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err);
  });