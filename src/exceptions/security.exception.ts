import { BaseException } from "./base.exception";

export enum SecurityExceptionCodes {
    INVALID_BASE64 = 7632074,
    INVALID_JSON = 7205904,
    INVALID_DATA = 7281376,
    INVALID_SIGNATURE = 7891364,
    EXPIRED_SIGNATURE = 7033711
}

export class SecurityException extends BaseException {
    public sender = 'security.service';
}