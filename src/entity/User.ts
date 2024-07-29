import { Entity, PrimaryGeneratedColumn, Column, } from "typeorm";
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
    email: string;

  @Column("varchar")
    password: string;

  // @OneToMany(() => Internship, (internship) => internship.user, {cascade: true, eager: true})
  //   internships: Internship[];
}
