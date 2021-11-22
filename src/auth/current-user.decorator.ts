import {createParamDecorator, ExecutionContext} from "@nestjs/common";
import {User} from "./user.entity";

export const CurrentUser = createParamDecorator<User | null>((data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    
    return request.user ?? null;
});