
export enum LogsPaths {
    SYSTEM,
    SOCKET,
    CHAT,
    PROFILE,
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
        }
    },
    fileSize: '2MB',
    filesCount: 30
};
