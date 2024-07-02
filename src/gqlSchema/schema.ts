import userData from "../Mock_Data.json";
import { ApolloError } from "apollo-server-errors";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

const users: User[] = userData as User[];

export const typeDefs = `#graphql
  type User {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
    password: String!
  }

  type Query {
    user(id: ID!): User
    users(search: String, first: Int, after: String): UserConnection
  }

  type UserConnection {
    edges: [UserEdge]
    pageInfo: PageInfo
  }

  type UserEdge {
    cursor: String
    node: User
  }

  type PageInfo {
    endCursor: String
    hasNextPage: Boolean
  }
`;

export const resolvers = {
  Query: {
    users: (
      _: unknown,
      { search = "", first = 10, after }: { search?: string; first?: number; after?: string }
    ) => {
      // Filter users based on search query
      let filteredUsers = users.filter((user) =>
        user.firstName.toLowerCase().includes(search.toLowerCase()) ||
        user.lastName.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
      );

      // Handle pagination using cursor (after)
      if (after) {
        const cursorIndex = filteredUsers.findIndex((user) => user.id.toString() === after);
        filteredUsers = filteredUsers.slice(cursorIndex + 1);
      }

      // Select the first 'first' number of users after filtering and pagination
      const selectedUsers = filteredUsers.slice(0, first);

      // Map users to edges for GraphQL response
      const edges = selectedUsers.map((user) => ({
        cursor: user.id.toString(),
        node: user,
      }));

      // Determine endCursor and hasNextPage
      const endCursor = edges.length > 0 ? edges[edges.length - 1].cursor : null;
      const hasNextPage = filteredUsers.length > first;

      return {
        edges,
        pageInfo: {
          endCursor,
          hasNextPage,
        },
      };
    },
    user: (_: unknown, { id }: { id: string }): User | undefined => {
      // Find a user by ID
      const user = users.find((user) => user.id.toString() === id);

      // Throw an error if the user is not found
      if (!user) {
        throw new ApolloError("User not found", "NOT_FOUND", {
          statusCode: 404,
        });
      }

      return user;
    },
  },
};
