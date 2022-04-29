import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LoggerService } from "../service/logger.service";
import { LogsPaths } from "../config/logger.config";

@Injectable()
export class RatingCommand {
    constructor(
        private readonly logger: LoggerService
    ) { }

    @Cron(CronExpression.EVERY_30_SECONDS)
    handleCron() {
        this.logger.info('Called every 30 seconds', LogsPaths.RATING);
    }
}