import {AuthGuard} from "@nestjs/passport";
import {UnauthorizedException} from "@nestjs/common";

export class AuthGuardJwt extends AuthGuard('jwt') {
    handleRequest (err, user, info: Error) {
        if (err || !user) {
            throw err || new UnauthorizedException(info.name === 'TokenExpiredError' ? 'TokenExpired' : 'Unauthorized');
        }
        return user;
    }
}