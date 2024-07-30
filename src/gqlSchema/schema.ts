import { AppDataSource } from "../db.config";
import { User } from "../entity/User";
import { ApolloError } from "apollo-server-errors";

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
    users: async (
      _: unknown,
      { search = "", first = 10, after }: { search?: string; first?: number; after?: string }
    ) => {
      const userRepository = AppDataSource.getRepository(User);

      // Filter users based on search query
      let query = userRepository.createQueryBuilder("user");
      if(search) {
        query = query.where(
          "user.firstName LIKE :search OR user.lastName LIKE:search or user.email LIKE:search",
          { search: `%${search}%` }
        );
      }
    

      // Handle pagination using cursor (after)
      if (after) {
        query = query.andWhere("user.id > :after", { after });
      }
      
      //Get users with pagination
      const [selectedUsers, filteredUsers] = await query.take(first).getManyAndCount();

      // Map users to edges for GraphQL response
      const edges = selectedUsers.map((user) => ({
        cursor: user.id.toString(),
        node: user,
      }));

      // Determine endCursor and hasNextPage
      const endCursor = edges.length > 0 ? edges[edges.length - 1].cursor : null;
      const hasNextPage = filteredUsers > first;

      return {
        edges,
        pageInfo: {
          endCursor,
          hasNextPage,
        },
      };
    },
    user: async (_: unknown, { id }: { id: string }): Promise <User | undefined> => {
      const userRepository = AppDataSource.getRepository(User);

      // Find a user by ID
      const user = await userRepository.findOneBy({ id: parseInt(id) });
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
