import {Column, Entity, JoinColumn, ManyToOne, PrimaryColumn} from "typeorm";
import {User} from "../auth/user.entity";

export enum ContactType {
    PAIR,
    LIKE
}

@Entity()
export class Contact {
    @PrimaryColumn()
    fromUserId: number;

    @PrimaryColumn()
    toUserId: number;

    @ManyToOne(() => User, fromUser => fromUser.contactFrom, {nullable: false})
    @JoinColumn()
    fromUser: User;

    @ManyToOne(() => User, toUser => toUser.contactTo, {nullable: false})
    @JoinColumn()
    toUser: User;

    @Column({nullable: true})
    type: ContactType;
}