import { BaseException } from "./base.exception";

export enum FileSystemExceptionCodes {
    FILE_NOT_FOUND = 1890021,
    CAN_NOT_SAVE = 1580369,
    INVALID_PATH = 1970231,
    FILE_ALREADY_EXIST = 1058637,
}

export class FileSystemException extends BaseException {
    public sender = 'fileSystem.service';
}