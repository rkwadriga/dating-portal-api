import {Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, Unique} from "typeorm";
import {Expose} from "class-transformer";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    @Expose()
    id: number;

    @Column({unique: true})
    @Expose()
    email: string;

    @Column()
    password: string;

    @Column()
    @Expose()
    firstName: string;

    @Column()
    @Expose()
    lastName: string;
}