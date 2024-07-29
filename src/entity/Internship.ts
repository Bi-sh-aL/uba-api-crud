import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "./User";


@Entity()
export class Internship {
  @PrimaryGeneratedColumn()
    id: number;

  @Column()
    joinedDate: Date;

  @Column()
    completionDate: Date;

  @Column()
    isCertified: boolean;

  @Column()
    mentorName: string;

  @ManyToOne(() => User, (user) => user.id)//internships)
    user: User;
}
