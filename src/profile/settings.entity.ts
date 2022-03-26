import {Column, Entity, JoinColumn, OneToOne, PrimaryColumn} from "typeorm";
import {User} from "../auth/user.entity";
import {Gender} from "./profile.entity";
import {Length} from "class-validator";


@Entity()
export class Settings {
    @PrimaryColumn()
    userId: number;

    @Column({nullable: true})
    @Length(4, 6)
    showGender?: Gender;

    @OneToOne(() => User, user => user.settings, {nullable: false})
    @JoinColumn()
    user: User;
}