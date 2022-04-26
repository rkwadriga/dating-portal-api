import { BaseException } from "./base.exception";

export enum DialogExceptionCodes {
    PAIR_NOT_FOUND = 4305681
}

export class DialogException extends BaseException {
    public sender = 'dialog.service';
}