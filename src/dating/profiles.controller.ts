import {
    BadRequestException,
    ClassSerializerInterceptor,
    Controller,
    Delete,
    Get,
    NotFoundException,
    Param,
    ParseUUIDPipe,
    Post,
    SerializeOptions,
    UseGuards,
    UseInterceptors
} from  "@nestjs/common";
import { ProfilesService } from  "./profiles.service";
import { AuthGuardJwt } from  "../auth/guards/auth-guard.jwt";
import { CurrentUser } from  "../auth/current-user.decorator";
import { User } from  "../auth/user.entity";
import { ProfileInfoDto } from  "./output/profile.info.dto";
import { DatingService } from  "./dating.service";
import { DatingException, DatingExceptionCodes } from  "../exceptions/dating.exception";
import { LoggerService, LogsPaths } from  "../service/logger.service";
import { RatingService } from "../service/rating.service";

@Controller('/api/dating/profiles')
@SerializeOptions({strategy: 'excludeAll'})
export class ProfilesController {
    constructor (
        private readonly profilesService: ProfilesService,
        private readonly datingService: DatingService,
        private readonly logger: LoggerService,
        private readonly ratingService: RatingService
    ) {
        this.logger.setPath(LogsPaths.PROFILE);
    }

    @Get('/next')
    @UseGuards(AuthGuardJwt)
    async getNext(@CurrentUser() user: User) {
        const nextProfile = await this.profilesService.getDatingProfileForUser(user, true);
        if (nextProfile === null) {
            throw new NotFoundException('There are no move accounts left');
        }

        return new ProfileInfoDto(nextProfile);
    }

    @Delete()
    @UseGuards(AuthGuardJwt)
    async clearContacts(@CurrentUser() user: User) {
        await this.datingService.clearContactsForUser(user);

        return {};
    }

    @Get('/:id')
    @UseGuards(AuthGuardJwt)
    @UseInterceptors(ClassSerializerInterceptor)
    async findOne(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
        this.ratingService.calculate();
        const profile = await this.profilesService.getProfileInfoByUuid(id, user);
        if (!profile) {
            this.logger.error(`Profile nut found by uuid: "${id}"`);
            throw new NotFoundException(`Profile not found`);
        }

        return  new ProfileInfoDto(profile);
    }

    @Post('/:id/like')
    @UseGuards(AuthGuardJwt)
    async like(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
        let isPair = false;
        try {
            isPair = await this.datingService.like(user, id);
        } catch (e) {
            this.logger.error(`Can not like pair "${id}": ${e.message}`);
            if (e instanceof DatingException && e.code === DatingExceptionCodes.PAIR_NOT_FOUND) {
                throw new NotFoundException(`User ${id} not found`);
            } else {
                throw new BadRequestException(`Can not like user ${id}: ${e.message}`);
            }
        }

        return {isPair};
    }
}