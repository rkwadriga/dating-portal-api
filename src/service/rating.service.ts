import { Injectable } from "@nestjs/common";
import { LoggerService } from "./logger.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Contact } from "../dating/contact.entity";
import { Repository } from "typeorm";
import { User } from "../auth/user.entity";
import { Rating } from "../profile/rating.entity";
import { ratingConfig } from "../config/rating.config";
import {addPeriod} from "../helpers/time.helper";

@Injectable()
export class RatingService {
    private calculatingTimePeriod = ratingConfig.calculatingTimePeriod;

    constructor(
        @InjectRepository(User)
        private readonly profileRepository: Repository<User>,
        @InjectRepository(Contact)
        private readonly contactRepository: Repository<Contact>,
        @InjectRepository(Rating)
        private readonly ratingRepository: Repository<Rating>,
        private readonly logger: LoggerService
    ) { }

    public calculate(): void {
        const fromDate = addPeriod(this.calculatingTimePeriod);
        console.log(new Date());
        console.log(fromDate);
    }
}