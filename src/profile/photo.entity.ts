import {Entity, Column, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn} from "typeorm";
import {User} from "../auth/user.entity";
import {FileSystemService} from "../service/fileSystem.service";

@Entity()
export class Photo {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false})
    fileName: string;

    @Column({nullable: false})
    size: number;

    @Column({nullable: false, default: false})
    isAvatar: boolean;

    @CreateDateColumn({nullable: false})
    createdAd: Date;

    @ManyToOne(() => User, user => user.photos, {nullable: false})
    user: User;
}