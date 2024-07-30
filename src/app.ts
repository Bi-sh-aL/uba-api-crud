import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { typeDefs, resolvers } from "./gqlSchema/schema.ts";
import Routes from "./router/indexRoutes.ts";
import cors from "cors";

export const app = express();
const PORT = Number(process.env.PORT) || 8000;

// Middleware for parsing JSON bodies
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(cors());

// Rest API routes
app.use("/", Routes);



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

