import {
    BadRequestException,
    ClassSerializerInterceptor,
    Controller,
    Get,
    NotFoundException,
    Param,
    ParseUUIDPipe,
    Req,
    SerializeOptions,
    UseGuards,
    UseInterceptors
} from "@nestjs/common";
import { AuthGuardJwt } from "../auth/guards/auth-guard.jwt";
import { CurrentUser } from "../auth/current-user.decorator";
import { User } from "../auth/user.entity";
import { DialogService } from "./dialog.service";
import { Request } from 'express';
import { BaseController } from "../base.controller";
import { DialogInfoDto } from "./output/dialog.info.dto";
import { DialogException, DialogExceptionCodes } from "../exceptions/dialog.exception";
import { LoggerService, LogsPaths } from "../service/logger.service";

@Controller('/api/dialog')
@SerializeOptions({strategy: 'excludeAll'})
export class DialogController extends BaseController {
    constructor(
        private readonly dialogService: DialogService,
        private readonly logger: LoggerService
    ) {
        super();
        this.logger.setPath(LogsPaths.DIALOG);
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
            this.logger.error(`Can not get the dialog for pair "${id}": ${e.message}`);
            if (e instanceof DialogException && e.code === DialogExceptionCodes.PAIR_NOT_FOUND) {
                throw new NotFoundException(e.message);
            } else {
                throw new BadRequestException(e.message);
            }
        }
    }
}