import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LoggerService, LogsPaths } from "../service/logger.service";

@Injectable()
export class RatingCommand {
    constructor(
        private readonly logger: LoggerService
    ) {
        this.logger.setPath(LogsPaths.RATING);
    }

    @Cron(CronExpression.EVERY_30_SECONDS)
    handleCron() {
        this.logger.info('Called every 30 seconds');
    }
}