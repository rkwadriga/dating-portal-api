import {Injectable} from "@nestjs/common";

@Injectable()
export class LoggerService {
    public info (path: string, msg: string, context?: any) {
        this.writeMessage('INFO', path, msg, context);
    }

    public error (path: string, msg: string, context?: any) {
        this.writeMessage('INFO', path, msg, context);
    }

    private writeMessage (level: string, path: string, msg: string, context: any) {
        let message = `${level} (${path}): ${msg}`;
        if (context !== undefined) {
            message += ` Context: ${JSON.stringify(context)}`;
        }
        console.log(message);
    }
}