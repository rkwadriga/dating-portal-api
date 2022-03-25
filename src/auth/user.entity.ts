import {Column, Entity, OneToMany, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn} from "typeorm";
import {Photo} from "../profile/photo.entity";
import {Expose} from "class-transformer";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true, length: 36})
    uuid: string;

    @Column({unique: true})
    email: string;

    @Column()
    password: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => Photo, photo => photo.user, {eager: true, cascade: true})
    photos: Photo[];

    avatarPhoto: Photo;

    public setAvatar(photo: Photo) {
        if (photo !== undefined) {
            this.avatarPhoto = photo;
        }
    }

    public getAvatar(): Photo {
        if (this.avatarPhoto) {
            return this.avatarPhoto;
        }

        this.photos.every(photo => {
            this.avatarPhoto = photo;
            return !photo.isAvatar;
        });

        return this.avatarPhoto;
    }

    public addPhoto(photo: Photo): this {
        if (this.photos === undefined) {
            this.photos = [];
        }

        photo.user = this;
        this.photos.push(photo);

        if (photo.isAvatar) {
            this.avatarPhoto = photo;
        }

        return this;
    }
}