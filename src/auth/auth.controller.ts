import {
    ClassSerializerInterceptor,
    Controller,
    Body,
    Get,
    Post,
    SerializeOptions,
    UseGuards,
    UseInterceptors
} from "@nestjs/common";



@Controller('/api/auth')
export class AuthController {

    @Post('/registration')
    async registration(@Body() input: any) {
        console.log(input);
    }
}