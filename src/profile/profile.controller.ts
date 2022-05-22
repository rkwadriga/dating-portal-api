import {
    BadRequestException,
    Body,
    ClassSerializerInterceptor,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    InternalServerErrorException,
    NotFoundException,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Put,
    SerializeOptions,
    UseGuards,
    UseInterceptors
} from "@nestjs/common";
import { ImageData, ProfileService, UserInitializationItem } from "./profile.service";
import { AuthGuardJwt } from "../auth/guards/auth-guard.jwt";
import { CurrentUser } from "../auth/current-user.decorator";
import { User } from "../auth/user.entity";
import { ProfileInfoDto } from "./output/profile.info.dto";
import { MeInfoDto } from "./output/me.info.dto";
import { UpdateProfileDto } from "./input/update.profile.dto";
import { PhotoInfoDto } from "./output/photo.info.dto";
import { CheckPasswordDto } from "./input/check.password.dto";
import * as bcrypt from 'bcrypt';
import { UpdatePasswordDto } from "./input/update.password.dto";
import { LoggerService, LogsPaths } from "../service/logger.service";
import { ProfileException, ProfileExceptionCodes } from "../exceptions/profile.exception";
import { inArray } from "../helpers/array.helper";

@Controller('/api/profile')
@SerializeOptions({strategy: 'excludeAll'})
export class ProfileController {
    constructor(
        private readonly profileService: ProfileService,
        private readonly logger: LoggerService
    ) {
        this.logger.setPath(LogsPaths.PROFILE);
    }

    @Get()
    @UseGuards(AuthGuardJwt)
    @UseInterceptors(ClassSerializerInterceptor)
    async findMe(@CurrentUser() user: User) {
        return new MeInfoDto(await this.profileService.findByUuid(user.uuid));
    }

    @Get('/:id')
    @UseGuards(AuthGuardJwt)
    @UseInterceptors(ClassSerializerInterceptor)
    async findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
        const profile = await this.profileService.findByUuid(id);
        if (!profile) {
            this.logger.info(`Profile not found by uuid "${id}"`);
            throw new NotFoundException(`Profile not found`);
        }

        return id !== user.uuid ? new ProfileInfoDto(profile) : new MeInfoDto(profile);
    }

    @Get('/:id/photos')
    @UseGuards(AuthGuardJwt)
    @UseInterceptors(ClassSerializerInterceptor)
    async findPhotos(@Param('id', ParseUUIDPipe) id: string) {
        const photos = await this.profileService.getPhotosByUserUuid(id);

        let result = [];
        photos.forEach(photo => {
            result.push(new PhotoInfoDto(photo));
        })
        return result;
    }

    @Patch()
    @UseGuards(AuthGuardJwt)
    @UseInterceptors(ClassSerializerInterceptor)
    async update(@Body() input: UpdateProfileDto, @CurrentUser() user: User) {
        // Init user (ser user's repository, profile and settings)
        await this.profileService.init(user, [UserInitializationItem.Profile, UserInitializationItem.Settings]);

        try {
            // Update user's params
            await this.profileService.update(user, input);
            this.logger.info(`User #${user.id} updated profile info`, input);
        } catch (e) {
            this.logger.error(`Can not update user #${user.id}: ${e.message}`, input);
            throw new InternalServerErrorException(e.message);
        }

        return new MeInfoDto(user);
    }

    @Delete()
    @UseGuards(AuthGuardJwt)
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@CurrentUser() user: User) {
        try {
            const result = await this.profileService.delete(user);
            this.logger.info(`User #${user.id} deleted his profile`);
            return result;
        } catch (e) {
            this.logger.error(`Can not delete user: ${e.message}`, user);
            throw new InternalServerErrorException(e.message);
        }
    }

    @Post('/photos')
    @UseGuards(AuthGuardJwt)
    async uploadPhotos(@Body() photos: ImageData[], @CurrentUser() user: User) {
        // Init user's photos and settings
        await this.profileService.init(user, [UserInitializationItem.Photos, UserInitializationItem.Settings]);
        try {
            await this.profileService.setPhotos(user, photos);
            this.logger.info(`User #${user.id} uploaded ${photos.length} images`);
        } catch (e) {
            if (e instanceof ProfileException && inArray(e.code, [
                ProfileExceptionCodes.MAX_PHOTO_SIZE_EXCITED,
                ProfileExceptionCodes.PHOTOS_LIMIT_EXCITED
            ])) {
                this.logger.info(`User's #${user.id} photos updating failed: ${e.message}`);
                throw new BadRequestException(e.message);
            }
            this.logger.error(`Can not update user's #${user.id} photos: ${e.message}`);
            throw new InternalServerErrorException(e.message);
        }
        return {};
    }

    @Put('/password-check')
    @UseGuards(AuthGuardJwt)
    async checkPassword(@Body() input: CheckPasswordDto,  @CurrentUser() user: User) {
        const isMatch = await bcrypt.compare(input.password, user.password);
        return {result: isMatch};
    }

    @Patch('/password')
    @UseGuards(AuthGuardJwt)
    async updatePassword(@Body() input: UpdatePasswordDto,  @CurrentUser() user: User) {
        try {
            await this.profileService.updatePassword(user, input);
            this.logger.info(`User #${user.id} updated password`);
        } catch (e) {
            if (e instanceof ProfileException && inArray(e.code, [
                ProfileExceptionCodes.PASSWORD_VALIDATION_ERROR,
                ProfileExceptionCodes.INVALID_PASSWORD
            ])) {
                this.logger.info(`User's #${user.id} password updating failed: ${e.message}`);
                throw new BadRequestException(e.message);
            }

            this.logger.error(`Can not update user's #${user.id} password: ${e.message}`);
            throw new InternalServerErrorException(e.message);
        }
        return {};
    }
}