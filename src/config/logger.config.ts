
export enum LogsPaths {
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
}

export const loggerConfig = {
    files: {
        [LogsPaths.SYSTEM]: {
            info: 'system/info.log',
            error: 'system/error.log',
        },
        [LogsPaths.AUTH]: {
            info: 'auth/info.log',
            error: 'auth/error.log',
        },
        [LogsPaths.ACCOUNT]: {
            info: 'account/info.log',
            error: 'account/error.log',
        },
        [LogsPaths.SOCKET]: {
            info: 'socket/info.log',
            error: 'socket/error.log',
        },
        [LogsPaths.CHAT]: {
            info: 'chat/info.log',
            error: 'chat/error.log',
        },
        [LogsPaths.PROFILE]: {
            info: 'profile/info.log',
            error: 'profile/error.log',
        },
        [LogsPaths.PUBLIC]: {
            info: 'public/info.log',
            error: 'public/error.log',
        },
        [LogsPaths.DATING]: {
            info: 'dating/info.log',
            error: 'dating/error.log',
        },
        [LogsPaths.DIALOG]: {
            info: 'dialog/info.log',
            error: 'dialog/error.log',
        },
        [LogsPaths.RATING]: {
            info: 'rating/info.log',
            error: 'rating/error.log',
        }
    },
    fileSize: '2MB',
    filesCount: 30
};
