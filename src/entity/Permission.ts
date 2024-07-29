import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm";
import { Role } from "./Role";

@Entity()
export class Permission {
    @PrimaryGeneratedColumn()   
      id: number;

    @Column()
      name: string;   

    @ManyToMany(() => Role, (role) => role.permissions) 
      roles: Role[];
}