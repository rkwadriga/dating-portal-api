import {AuthGuard} from "@nestjs/passport";
import {UnauthorizedException} from "@nestjs/common";
import {HttpErrorCodes} from "../api/api.http";

export class AuthGuardJwt extends AuthGuard('jwt') {
    handleRequest (err, user, info: Error) {
        if (err || !user) {
            let errorMessage = HttpErrorCodes.UNAUTHORIZED;
            if (info) {
                switch (info.name) {
                    case 'TokenExpiredError':
                        errorMessage = HttpErrorCodes.EXPIRED_TOKEN;
                        break;
                    case 'JsonWebTokenError':
                        errorMessage = HttpErrorCodes.INVALID_TOKEN;
                        break;
                }
            }
            throw err || new UnauthorizedException(errorMessage);
        }
        return user;
    }
}