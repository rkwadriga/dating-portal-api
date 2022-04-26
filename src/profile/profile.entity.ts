import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { User } from "../auth/user.entity";
import { Length } from "class-validator";

export enum Gender {
    Male = 'Male',
    Female = 'Female',
    Other = 'Other'
}

export enum Orientation {
    Hetero = 'Hetero',
    Bisexual = 'Bisexual',
    Gay = 'Gay',
    Pervert = 'Pervert'
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

    @Column({nullable: false, default: Orientation.Hetero})
    @Length(3, 8)
    orientation: Orientation;

    @Column({nullable: true, type: "text"})
    @Length(2, 5000)
    about?: string;

    @OneToOne(() => User, user => user.profile, {nullable: false})
    @JoinColumn()
    user: User;
}