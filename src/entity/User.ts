import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, } from "typeorm";
import { Role } from "./Role";
// import { Internship } from "./Internship";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
    id: number;

  @Column("varchar")
    firstName: string;

  @Column("varchar")
    lastName: string;

  @Column("varchar")
    username: string;  

  @Column("varchar")
    mobileNumber: string;  

  @Column("varchar")
    email: string;

  @Column("varchar")
    password: string;

  // @OneToMany(() => Internship, (internship) => internship.user, {cascade: true, eager: true})
  //   internships: Internship[];

  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable({
    name: "user_roles",
    joinColumn: {
      name: "user_id",
      referencedColumnName: "id"
    },
    inverseJoinColumn: {
      name: "role_id",
      referencedColumnName: "id"
    }
  })
    role: Role[];
}
