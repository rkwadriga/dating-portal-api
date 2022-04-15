import {Request} from 'express';
import * as MD5 from "crypto-js/md5"

interface QueryParams {
    [key: string]: string;
}

export class BaseController {
    private queryParams: {[key: string]: QueryParams | null} = {};

    public getQueryParams(request: Request): QueryParams | null {
        const key = MD5(request.url).toString();
        if (this.queryParams[key] !== undefined) {
            return this.queryParams[key];
        }

        const match = request.url.match(/.+\?(.+)/);
        if (match === null) {
            return this.queryParams[key] = null;
        }

        match[1].split('&').forEach(part => {
            const match = part.match(/(\w+)=(.*)/);
            if (match === null) {
                return;
            }
            if (this.queryParams[key] === undefined) {
                this.queryParams[key] = {};
            }
            this.queryParams[key][match[1]] = match[2];
        });

        return this.queryParams[key];
    }

    public getQueryParam(request: Request, name: string, type = 'string'): any | null {
        let result: any = null;
        if (request.params[name] === undefined) {
            const params = this.getQueryParams(request);
            if (params === null) {
                return null;
            }
            result = params[name];
        } else {
            result = request.params[name];
        }

        switch (type) {
            case 'string':
                return result ? result.toString() : null;
            case 'number':
                return result ? Number(result) : null;
            case 'array':
                return result ? result.split(',') : null;
            case 'object':
            case 'json':
                return result ? JSON.parse(result) : null;
        }

        return result;
    }
}