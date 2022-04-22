export class BaseException extends Error {
    public sender: string;

    constructor(public message: string, public code = 0) {
        super(message);
    }
}