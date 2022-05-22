import { Injectable } from "@nestjs/common";
import { loggerConfig } from "../config/logger.config";
import { str2Bytes } from "../helpers/number.helper";
import { FileSystemService } from "./fileSystem.service";
import { formatDate } from "../helpers/time.helper";
import { LogsPathsEnum } from "../config/logger.config";

export const LogsPaths = LogsPathsEnum;

@Injectable()
export class LoggerService {
    private config = loggerConfig;
    private path = LogsPathsEnum.SYSTEM;

    constructor(
        private readonly fileSystem: FileSystemService
    ) { }

    public setPath(path: LogsPathsEnum): void {
        this.path = path;
    }

    public info (msg: string, path: LogsPathsEnum|object|null = null, context?: any) {
        this.writeMessage('info', path, msg, context);
    }

    public error (msg: string, path: LogsPathsEnum|object|null = null, context?: any) {
        this.writeMessage('error', path, msg, context);
    }

    private writeMessage (level: string, path: LogsPathsEnum|object|null = null, msg: string, context: any) {
        if (typeof path === 'object') {
            context = path;
            path = this.path;
        } else if (path === null) {
            path = this.path;
        }

        let message = formatDate() + ' ' + msg;
        if (context !== undefined) {
            if (typeof context !== 'string') {
                context = JSON.stringify(context);
            }
            message += `\n  Context: ${context}`;
        }

        this.fileSystem.write(this.getLogFile(level, path), message + "\n", true);
        console.log(message);
    }

    private getLogFile(level: string, logPath: LogsPathsEnum): string {
        let file = this.config.files[logPath][level];
        if (file === undefined) {
            file = this.config.files[logPath].info.replace('info', level);
        }
        file = this.fileSystem.getLogsDir() + '/' + file;

        const dir = this.fileSystem.getFileDir(file, true);
        const files = this.fileSystem.scandir(dir);

        let lastFile: string | null = null;
        files.forEach(path => {
            if (path.indexOf(level) === 0) {
                lastFile = dir + '/' + path;
            }
        });
        if (lastFile === null) {
            return this.indexFile(file, 1);
        }

        if (this.fileSystem.fileSIze(lastFile) < str2Bytes(this.config.fileSize)) {
            return lastFile;
        }

        const lastIndex = this.getFileIndex(lastFile);
        if (lastIndex < this.config.filesCount) {
            return this.indexFile(file, lastIndex + 1);
        }

        this.fileSystem.delete(this.indexFile(file, 1));
        files.forEach(filePath => {
            const newIndex = this.getFileIndex(filePath) - 1;
            this.fileSystem.rename(dir + '/' + filePath, this.indexFile(file, newIndex));
        });

        return this.indexFile(file, this.config.filesCount);
    }

    private indexFile(file: string, index: number): string {
        const strIndex = index < 10 ? '0' + index : index.toString();
        return file.replace(/^(.+)\.(\w+)$/, `$1-${strIndex}.$2`);
    }

    private getFileIndex(file: string): number {
        const match = file.match(/^.+-(\d+)\.\w+$/);
        return match !== null ? parseInt(match[1]) : 0;
    }
}