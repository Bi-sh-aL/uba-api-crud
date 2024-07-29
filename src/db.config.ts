import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { Internship } from "./entity/Internship";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: "root",
  password: "Password@123",
  database: "uba_db",
  entities: [User, Internship],
  migrationsTableName: "custom_migration_table",
  migrations: ["src/migration/*.ts"],
  synchronize: false,
  logging: true,
  
});



AppDataSource.initialize()
  .then(() => {
    console.log("Database connected successfully.");
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err);
  });