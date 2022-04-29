import {
    Column,
    Entity,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn
} from "typeorm";
import { Photo } from "../profile/photo.entity";
import { Profile } from "../profile/profile.entity";
import { Settings } from "../profile/settings.entity";
import { Contact } from "../dating/contact.entity";
import { yearsFromDate } from "../helpers/time.helper";
import { Rating } from "../profile/rating.entity";

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

    @OneToMany(() => Photo, photo => photo.user, {cascade: true})
    photos: Photo[];

    @OneToOne(() => Profile, profile => profile.user)
    profile: Profile;

    @OneToOne(() => Settings, settings => settings.user)
    settings: Settings;

    @OneToMany(() => Contact, contactFrom => contactFrom.fromUser)
    contactFrom: Contact[];

    @OneToMany(() => Contact, contactTo => contactTo.toUser)
    contactTo: Contact[];

    @OneToOne(() => Rating, rating => rating.user)
    rating: Rating;

    public avatarPhoto?: Photo;

    public isLiked = false;

    public isPair = false;

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
        return yearsFromDate(this.profile.birthday);
    }
}