import {AuthGuard} from "@nestjs/passport";
import {HttpErrorCodes} from "../../api/api.http";
import {UnauthorizedException} from "@nestjs/common";

export class AuthGuardRefresh extends AuthGuard('refresh') {
    handleRequest (err, user, info: Error) {
        if (!err && !info) {
            return user;
        }
        if (info && info.name == 'JsonWebTokenError') {
            throw new UnauthorizedException(HttpErrorCodes.INVALID_TOKEN);
        }
        if (!info || info.name !== 'TokenExpiredError') {
            throw err || new UnauthorizedException(HttpErrorCodes.UNAUTHORIZED);
        }

        return user;
    }
}