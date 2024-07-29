import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { typeDefs, resolvers } from "./gqlSchema/schema.ts";
import userRoutes from "./router/userRoutes";

export const app = express();
const PORT = Number(process.env.PORT) || 8000;

// Middleware for parsing JSON bodies
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Rest API routes
app.use("/", userRoutes);


async function startServer(){
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  app.use("/graphql", expressMiddleware(server));

  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
    console.log(`GraphQL endpoint at http://localhost:${PORT}/graphql`);
  });
}

startServer();

