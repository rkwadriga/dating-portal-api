export enum LogsPathsEnum {
    SYSTEM,
    AUTH,
    ACCOUNT,
    SOCKET,
    CHAT,
    PROFILE,
    PUBLIC,
    DATING,
    DIALOG,
    RATING,
    SECURITY,
}

export const loggerConfig = {
    files: {
        [LogsPathsEnum.SYSTEM]: {
            info: 'system/info.log',
            error: 'system/error.log',
        },
        [LogsPathsEnum.AUTH]: {
            info: 'auth/info.log',
            error: 'auth/error.log',
        },
        [LogsPathsEnum.ACCOUNT]: {
            info: 'account/info.log',
            error: 'account/error.log',
        },
        [LogsPathsEnum.SOCKET]: {
            info: 'socket/info.log',
            error: 'socket/error.log',
        },
        [LogsPathsEnum.CHAT]: {
            info: 'chat/info.log',
            error: 'chat/error.log',
        },
        [LogsPathsEnum.PROFILE]: {
            info: 'profile/info.log',
            error: 'profile/error.log',
        },
        [LogsPathsEnum.PUBLIC]: {
            info: 'public/info.log',
            error: 'public/error.log',
        },
        [LogsPathsEnum.DATING]: {
            info: 'dating/info.log',
            error: 'dating/error.log',
        },
        [LogsPathsEnum.DIALOG]: {
            info: 'dialog/info.log',
            error: 'dialog/error.log',
        },
        [LogsPathsEnum.RATING]: {
            info: 'rating/info.log',
            error: 'rating/error.log',
        },
        [LogsPathsEnum.SECURITY]: {
            info: 'security/info.log',
            error: 'security/error.log',
        }
    },
    fileSize: '2MB',
    filesCount: 30
};
