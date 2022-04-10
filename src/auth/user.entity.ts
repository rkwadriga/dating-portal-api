import {
    Column,
    Entity,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn
} from "typeorm";
import {Photo} from "../profile/photo.entity";
import {Profile} from "../profile/profile.entity";
import {Settings} from "../profile/settings.entity";
import {Contact} from "../dating/contact.entity";

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

    @OneToOne(() => Profile, profile => profile.user)
    profile: Profile;

    @OneToOne(() => Settings, settings => settings.user)
    settings: Settings;

    avatarPhoto?: Photo;

    @OneToMany(() => Contact, contactFrom => contactFrom.fromUser)
    contactFrom: Contact[];

    @OneToMany(() => Contact, contactTo => contactTo.toUser)
    contactTo: Contact[];

    public setAvatar(photo: Photo) {
        if (photo !== undefined) {
            this.avatarPhoto = photo;
        }
    }

    public getAvatar(): Photo | undefined {
        if (this.avatarPhoto !== undefined) {
            return this.avatarPhoto;
        }

        if (this.photos !== undefined) {
            this.photos.every(photo => {
                this.avatarPhoto = photo;
                return !photo.isAvatar;
            });
        }

        return this.avatarPhoto;
    }

    public addPhoto(photo: Photo): this {
        if (this.photos === undefined) {
            this.photos = [];
        }

        photo.userId = this.id;
        this.photos.push(photo);

        if (photo.isAvatar) {
            this.avatarPhoto = photo;
        }

        return this;
    }

    public getAge(): number {
        const diff = (new Date()).valueOf() - (new Date(this.profile.birthday)).valueOf();

        return Math.ceil(diff / (1000 * 3600 * 24 * 365));
    }
}