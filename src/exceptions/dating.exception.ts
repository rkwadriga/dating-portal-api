import {BaseException} from "./base.exception";

export enum DatingExceptionCodes {
    INVALID_PAIR = 3806897,
    PAIR_NOT_FOUND = 3753175,
}

export class DatingException extends BaseException {
    public sender = 'dating.service';
}