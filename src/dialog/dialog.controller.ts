import {
    Controller,
    SerializeOptions,
    Req,
    Get,
    UseGuards,
    UseInterceptors,
    ClassSerializerInterceptor, Param, ParseUUIDPipe, NotFoundException, BadRequestException
} from "@nestjs/common";
import { AuthGuardJwt } from "../auth/guards/auth-guard.jwt";
import { CurrentUser } from "../auth/current-user.decorator";
import { User } from "../auth/user.entity";
import { DialogService } from "./dialog.service";
import { Request } from 'express';
import { BaseController } from "../base.controller";
import { DialogInfoDto } from "./output/dialog.info.dto";

@Controller('/api/dialog')
@SerializeOptions({strategy: 'excludeAll'})
export class DialogController extends BaseController {
    constructor(
        private readonly dialogService: DialogService
    ) {
        super();
    }

    @Get('/:id')
    @UseGuards(AuthGuardJwt)
    @UseInterceptors(ClassSerializerInterceptor)
    public async getDialog(
        @CurrentUser() user: User,
        @Param('id', ParseUUIDPipe) id: string,
        @Req() request: Request
    ) {
        try {
            const [limit, offset] = [
                this.getQueryParam(request, 'limit', 'number'),
                this.getQueryParam(request, 'offset', 'number') ?? 0
            ];
            return new DialogInfoDto(await this.dialogService.getDialog(user, id, limit, offset));
        } catch (e) {
            if (e.message.toString().indexOf('not found') !== -1) {
                throw new NotFoundException(e.message);
            } else {
                throw new BadRequestException(e.message);
            }
        }
    }
}