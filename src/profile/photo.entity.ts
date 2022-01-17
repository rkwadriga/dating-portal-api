import {Entity, Column, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn} from "typeorm";
import {User} from "../auth/user.entity";

@Entity()
export class Photo {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false})
    path: string;

    @Column({nullable: false})
    size: number;

    @Column({nullable: false, default: false})
    isAvatar: boolean;

    @CreateDateColumn({nullable: false})
    createdAd: Date;

    @ManyToOne(() => User, user => user.photos, {nullable: false})
    user: User;
}