export const typeDefs = `#graphql
   type User {
     id: ID!
     firstName: String!
     lastName: String!
     email: String!
     password: String!
   }
   type Query {
     users: [User]
     user(id: ID!) : User
   }
`;