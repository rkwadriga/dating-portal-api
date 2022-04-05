import {Entity, Column, ManyToOne, PrimaryColumn, CreateDateColumn, JoinColumn} from "typeorm";
import {User} from "../auth/user.entity";

@Entity()
export class Photo {
    @PrimaryColumn()
    userId: number;

    @PrimaryColumn()
    fileName: string;

    @Column({nullable: false})
    size: number;

    @Column({nullable: false, default: false})
    isAvatar: boolean;

    @CreateDateColumn({nullable: false})
    createdAd: Date;

    @ManyToOne(() => User, user => user.photos, {nullable: false})
    @JoinColumn()
    user: User;
}