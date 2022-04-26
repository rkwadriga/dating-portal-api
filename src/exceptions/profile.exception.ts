import { BaseException } from "./base.exception";

export enum ProfileExceptionCodes {
    UPDATE_ERROR = 6321750,
    DELETE_ERROR = 6479203,
    MAX_PHOTO_SIZE_EXCITED = 6923147,
    PHOTOS_LIMIT_EXCITED = 6214698,
    PHOTOS_DELETING_ERROR = 6027936,
    PHOTOS_SAVING_ERROR = 6293025,
    INVALID_PASSWORD = 6980364,
    PASSWORD_VALIDATION_ERROR = 6380911,
    PASSWORD_SAVING_ERROR = 6329784
}

export class ProfileException extends BaseException {
    public sender = 'profile.service';
}