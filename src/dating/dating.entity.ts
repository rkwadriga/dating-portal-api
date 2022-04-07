import {Column, Entity, JoinColumn, ManyToOne, PrimaryColumn} from "typeorm";
import {User} from "../auth/user.entity";

export enum ContactType {
    PAIR,
    LIKE
}

@Entity()
export class Dating {
    @PrimaryColumn()
    fromUserId: number;

    @PrimaryColumn()
    toUserId: number;

    @ManyToOne(() => User, fromUser => fromUser.datingFrom, {nullable: false})
    @JoinColumn()
    fromUser: User;

    @ManyToOne(() => User, toUser => toUser.datingTo, {nullable: false})
    @JoinColumn()
    toUser: User;

    @Column({nullable: true})
    type: ContactType;
}