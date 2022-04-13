import {Column, Entity, ManyToOne, PrimaryColumn} from 'typeorm';
import {User} from "../auth/user.entity";

@Entity()
export class Message {
    @PrimaryColumn({length: 36})
    uuid: string;

    @Column({nullable: false})
    text: string;

    @Column({nullable: false})
    time: Date;

    @ManyToOne(() => User, {nullable: false})
    fromUser: User;

    @ManyToOne(() => User, {nullable: false})
    toUser: User;
}