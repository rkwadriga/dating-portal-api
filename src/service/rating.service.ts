import { Injectable } from "@nestjs/common";
import { LoggerService } from "./logger.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Contact, ContactType } from "../dating/contact.entity";
import { Repository } from "typeorm";
import { Rating } from "../profile/rating.entity";
import { ratingConfig } from "../config/rating.config";
import { addPeriod, formatDate } from "../helpers/time.helper";
import { LogsPaths } from "../config/logger.config";

@Injectable()
export class RatingService {
    private calculatingTimePeriod = ratingConfig.calculatingTimePeriod;

    constructor(
        @InjectRepository(Contact)
        private readonly contactRepository: Repository<Contact>,
        @InjectRepository(Rating)
        private readonly ratingRepository: Repository<Rating>,
        private readonly logger: LoggerService
    ) { }

    public async calculate(): Promise<void> {
        this.logger.info('Start calculating ratings', LogsPaths.RATING);

        // Get not updated for some period ratings
        const fromDate = addPeriod(this.calculatingTimePeriod);
        const ratings = await this.ratingRepository.createQueryBuilder('r')
            .where('updatedAt < :from_date', {'from_date': fromDate})
            .getMany();

        if (ratings.length === 0) {
            this.logger.info(`There is no rating not updated from ${formatDate(fromDate)} fround. Exit`, LogsPaths.RATING);
            return;
        }

        this.logger.info(`Found ${ratings.length} ratings not updated from ${formatDate(fromDate)}`, LogsPaths.RATING);
        const currentDate = new Date();
        let updatedCount = 0;
        for (let i = 0; i < ratings.length; i++) {
            const rating = ratings[i];

            // Get ratings of user that liked the current user
            const pairsIn = await this.contactRepository.createQueryBuilder('l')
                .select('pr.rating', 'rating')
                .innerJoin(Rating, 'pr', 'pr.userId = l.fromUserId')
                .where({toUserId: rating.userId, type: ContactType.LIKE})
                .getRawMany();

            // Get ratings of user that current user liked
            const pairsOut = await this.contactRepository.createQueryBuilder('l')
                .select('pr.rating', 'rating')
                .innerJoin(Rating, 'pr', 'pr.userId = l.toUserId')
                .where({fromUserId: rating.userId, type: ContactType.LIKE})
                .getRawMany();

            let [ratingIn, ratingOut, pairsInCount, pairsOutCount] = [0, 0, 0, 0];
            pairsIn.forEach(pair => {
                pairsInCount++;
                ratingIn += pair.rating;
            });
            pairsOut.forEach(pair => {
                pairsOutCount++;
                ratingOut += pair.rating;
            });

            const [averageIn, averageOut] = [
                pairsInCount > 0 ? ratingIn / pairsInCount : 1,
                pairsOutCount > 0 ? ratingOut / pairsOutCount : 1
            ];

            rating.rating += Math.ceil((pairsInCount - pairsOutCount) * (averageIn / averageOut));
            rating.updatedAt = currentDate;

            try {
                await this.ratingRepository.save(rating);
                updatedCount++;
            } catch (e) {
                this.logger.error(`Can not update rating for user #${rating.userId}: ${e.message}`, LogsPaths.RATING, rating);
            }
        }

        this.logger.info(`Done. Updated ${updatedCount} ratings`, LogsPaths.RATING);
    }
}