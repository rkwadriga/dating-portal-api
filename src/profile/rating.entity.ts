import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { User } from "../auth/user.entity";
import { ratingConfig } from "../config/rating.config";

@Entity()
export class Rating {
    @PrimaryColumn()
    userId: number;

    @Column({type: 'smallint', nullable: false, default: ratingConfig.defaultRating})
    ratings: number;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToOne(() => User, user => user.rating, {nullable: false})
    @JoinColumn()
    user: User;
}