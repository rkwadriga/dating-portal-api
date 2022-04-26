
export enum LogsPaths {
    SYSTEM,
    SOCKET,
    CHAT,
    PROFILE,
    PUBLIC,
    DATING,
    DIALOG
}

export const loggerConfig = {
    files: {
        [LogsPaths.SYSTEM]: {
            info: 'system/info.log',
            error: 'system/error.log',
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
        }
        ,
        [LogsPaths.DIALOG]: {
            info: 'dialog/info.log',
            error: 'dialog/error.log',
        }
    },
    fileSize: '2MB',
    filesCount: 30
};
