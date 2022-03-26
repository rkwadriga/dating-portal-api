import {Column, Entity, JoinColumn, OneToOne, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";
import {User} from "../auth/user.entity";

export enum Gender {
    Male = 'Male',
    Female = 'Female',
    Other = 'Other'
}

@Entity()
export class Profile {
    @PrimaryColumn()
    userId: number;

    @Column()
    gender: Gender;

    @OneToOne(() => User, user => user.profile, {nullable: false})
    @JoinColumn()
    user: User;
}