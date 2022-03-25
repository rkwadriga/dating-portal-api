import {Column, Entity, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "../auth/user.entity";

export enum Gender {
    Male = 'Male',
    Female = 'Female',
    Other = 'Other'
}

@Entity()
export class Profile {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    gender: Gender;
}