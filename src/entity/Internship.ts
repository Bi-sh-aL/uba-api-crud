import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "./User";


@Entity()
export class Internship {
  @PrimaryGeneratedColumn()
    id: number;

  @Column("date")
    joinedDate: Date;

  @Column("date")
    completionDate: Date;

  @Column("boolean")
    isCertified: boolean;

  @Column("varchar")
    mentorName: string;

  @ManyToOne(() => User, (user) => user.id)//internships)
    user: User;
}
