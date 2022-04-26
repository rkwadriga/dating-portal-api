import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { User } from "../auth/user.entity";
import { Gender } from "./profile.entity";
import { Length } from "class-validator";

@Entity()
export class Settings {
    @PrimaryColumn()
    userId: number;

    @Column({nullable: true})
    @Length(4, 6)
    showGender?: Gender;

    @Column({type: 'tinyint', nullable: true})
    showAgeFrom?: number;

    @Column({type: 'tinyint', nullable: true})
    showAgeTo?: number;

    @Column({nullable: true})
    imagesLimit: number;

    @Column({nullable: true})
    maximumImageSIze: number;

    @OneToOne(() => User, user => user.settings, {nullable: false})
    @JoinColumn()
    user: User;
}