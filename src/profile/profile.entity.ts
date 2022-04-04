import {Column, Entity, JoinColumn, OneToOne, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";
import {User} from "../auth/user.entity";
import {Length} from "class-validator";

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
    @Length(4, 6)
    gender: Gender;

    @Column({type: 'date'})
    birthday: Date;

    @Column({nullable: true, type: "text"})
    @Length(2, 5000)
    about?: string;

    @OneToOne(() => User, user => user.profile, {nullable: false})
    @JoinColumn()
    user: User;
}