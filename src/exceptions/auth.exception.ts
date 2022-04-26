import { BaseException } from "./base.exception";

export enum AuthExceptionCodes {
    CREATE_ERROR = 5906367,
}

export class AuthException extends BaseException {
    public sender = 'auth.service';
}