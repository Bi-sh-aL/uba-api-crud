import express, { Request, Response } from "express";
import { createServer } from "http";
import fs from "fs/promises";
import path from "path";
import userData from "./Mock_Data.json";
import validate from "./middleware/validate";
import { createUserSchema, updateUserSchema } from "./validator/userValidator";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { typeDefs } from "./schema.ts";
import { ApolloError } from "apollo-server-errors";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

//Graphql server
const server = new ApolloServer({
  typeDefs,
  resolvers: {
    Query: {
      users: () => users,
      user: (_, args) => {
        const user =users.find((user) => user.id === Number(args.id));
        if (!user) {
          throw new ApolloError("User not found", "NOT_FOUND", { statusCode: 404 });
        }
        return user;
      } 
    },
  },

});

async function startApolloServer() {
  const { url } = await startStandaloneServer(server, {
    listen: { port: 9000 },
  });
  console.log(`Apollo server running at ${url}graphql`);
}

startApolloServer();

const users: User[] = userData as User[];

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/users", (req: Request, res: Response) => {
  const html = `
    <table border cellspacing=0>
    <tr>
       <th>First Name</th>
       <th>Last Name</th>
       <th>Email</th>
    </tr>
    ${users
    .map(
      (user) => `
        <tr key="${user.id}">
          <td>${user.firstName}</td>
          <td>${user.lastName}</td>
          <td>${user.email}</td>
        </tr>
        `
    )
    .join("")}
    </table>
    `;
  return res.send(html);
});

app
  .route("/api/users")
  .get((req: Request, res: Response) => {
    return res.json(users);
  })
  .post(validate(createUserSchema), async (req: Request, res: Response) => {
    const body = req.body;
    // Check for duplicate email
    if (users.some((user) => user.email === body.email)) {
      return res.status(409).json({ status: "Email already exists." });
    }
    //Find the highest existing id
    const highestId =
      users.length > 0
        ? users.reduce((max, user) => (user.id > max ? user.id : max), 0)
        : 0;
    //Assign a new id
    const newId = highestId + 1;

    const newUser: User = { id: newId, ...body };
    users.push(newUser);
    try {
      await fs.writeFile(
        path.join("./Mock_Data.json"),
        JSON.stringify(users, null, 2)
      );
      return res
        .status(201)
        .json({ status: "User added successfully", id: newUser.id });
    } catch (error) {
      return res.status(500).json({ status: "Failed to add user." });
    }
  });

app
  .route("/api/users/:id")
  .get((req: Request, res: Response) => {
    const id = Number(req.params.id);
    const user = users.find((user) => user.id === id);
    if (user) {
      return res.status(201).json(user);
    } else {
      return res.status(404).json({ message: "404 User not found" });
    }
  })
  .patch(validate(updateUserSchema), async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const userIndex = users.findIndex((user) => user.id == id);

    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...req.body };
      try {
        // Check for duplicate email if email is being updated
        if (
          req.body.email &&
          users.some((user) => user.email === req.body.email && user.id !== id)
        ) {
          return res.status(409).json({ status: "Email already exists." });
        }
        await fs.writeFile(
          path.join("./Mock_Data.json"),
          JSON.stringify(users, null, 2)
        );
        return res
          .status(200)
          .json({ status: `User with id ${id} updated successfully.` });
      } catch (error) {
        return res.status(500).json({ status: "Failed to update user." });
      }
    } else {
      return res.status(404).json({ message: "404 User not found" });
    }
  })
  .delete(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const userIndex = users.findIndex((user) => user.id === id);
    if (userIndex !== -1) {
      users.splice(userIndex, 1);
      try {
        await fs.writeFile(
          path.join("./Mock_Data.json"),
          JSON.stringify(users, null, 2)
        );
        return res
          .status(204)
          .json({ status: `User with id ${id} deleted successfully.` });
      } catch (error) {
        return res.status(500).json({ status: "Failed to update user." });
      }
    } else {
      return res.status(404).json({ message: "404 User not found" });
    }
  });

const myServer = createServer(app);

myServer.listen(PORT, () =>
  console.log(`Server started at http://localhost:${PORT}`)
);
