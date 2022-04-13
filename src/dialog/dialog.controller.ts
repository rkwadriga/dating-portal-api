import {
    Controller,
    SerializeOptions,
    Get,
    UseGuards,
    UseInterceptors,
    ClassSerializerInterceptor, Param, ParseUUIDPipe, NotFoundException, BadRequestException
} from "@nestjs/common";
import {AuthGuardJwt} from "../auth/guards/auth-guard.jwt";
import {CurrentUser} from "../auth/current-user.decorator";
import {User} from "../auth/user.entity";
import {DialogService} from "./dialog.service";
import {MessageInfoDto} from "./output/message.info.dto";

@Controller('/api/dialog')
@SerializeOptions({strategy: 'excludeAll'})
export class DialogController {
    constructor(
        private readonly dialogService: DialogService
    ) { }

    @Get('/:id')
    @UseGuards(AuthGuardJwt)
    @UseInterceptors(ClassSerializerInterceptor)
    public async getDialog(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
        try {
            const messages = await this.dialogService.getDialog(user, id);
            let result = [];
            messages.forEach(message => {
                result.push(new MessageInfoDto(message));
            });
            return result;
        } catch (e) {
            if (e.message.toString().indexOf('not found') !== -1) {
                throw new NotFoundException(e.message);
            } else {
                throw new BadRequestException(e.message);
            }
        }
    }
}