import {
    BadRequestException,
    Body,
    ClassSerializerInterceptor,
    ConflictException,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    NotFoundException,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Put,
    SerializeOptions,
    UploadedFile,
    UseGuards,
    UseInterceptors
} from "@nestjs/common";
import {ProfileService, UserInitializationItem, ImageData} from "./profile.service";
import {AuthGuardJwt} from "../auth/guards/auth-guard.jwt";
import {CurrentUser} from "../auth/current-user.decorator";
import {User} from "../auth/user.entity";
import {ProfileInfoDto} from "./output/profile.info.dto";
import {MeInfoDto} from "./output/me.info.dto";
import {UpdateProfileDto} from "./input/update.profile.dto";
import {FileInterceptor} from "@nestjs/platform-express";
import {PhotoInfoDto} from "./output/photo.info.dto";
import {CheckPasswordDto} from "./input/check.password.dto";
import * as bcrypt from 'bcrypt';
import {UpdatePasswordDto} from "./input/update.password.dto";

@Controller('/api/profile')
@SerializeOptions({strategy: 'excludeAll'})
export class ProfileController {
    constructor(
        private readonly profileService: ProfileService
    ) {}

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
        // Update user's params
        await this.profileService.update(user, input);

        return new MeInfoDto(user);
    }

    @Delete()
    @UseGuards(AuthGuardJwt)
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@CurrentUser() user: User) {
        return await this.profileService.delete(user);
    }

    @Post('/:id/photo')
    @UseGuards(AuthGuardJwt)
    @UseInterceptors(FileInterceptor('photo'))
    async uploadPhoto(@UploadedFile() file: Express.Multer.File, @CurrentUser() user: User) {
        // Init user (ser user's repository, settings and photos)
        await this.profileService.init(user, [UserInitializationItem.Photos, UserInitializationItem.Settings]);
        try {
            await this.profileService.addPhoto(user, file);
        } catch (e) {
            if (e.message.indexOf('already exist') !== -1) {
                throw new ConflictException(e.message);
            }
            throw new BadRequestException(e.message);
        }
    }

    @Post('/photos')
    @UseGuards(AuthGuardJwt)
    async uploadPhotos(@Body() photos: ImageData[], @CurrentUser() user: User) {
        // Init user's photos and settings
        await this.profileService.init(user, [UserInitializationItem.Photos, UserInitializationItem.Settings]);
        try {
            await this.profileService.setPhotos(user, photos);
        } catch (e) {
            throw new BadRequestException(e.message);
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
        } catch (e) {
            throw new BadRequestException(e.message);
        }
        return {};
    }
}