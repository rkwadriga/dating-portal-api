import { BaseException } from "./base.exception";

export enum ImageExceptionCodes {
    INVALID_SIZE = 2856697,
    INVALID_EXTENSION = 23701109,
    CAN_NOT_RESIZE = 2379215,
}

export class ImageException extends BaseException {
    public sender = 'image.service';
}