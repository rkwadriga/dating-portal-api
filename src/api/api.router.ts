
export enum HttpMethods {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    PATCH = 'PATCH',
    DELETE = 'DELETE'
}

export enum RoutesUrls {
    AUTH_REGISTRATION = 'POST /auth/registration',
    AUTH_LOGIN = 'POST /auth/login',
    PROFILE_EDIT = 'PATCH /profile/:id/:name/edit'
}

export type Request = {
    uri: string,
    method: HttpMethods|string
}

export class ApiRouter {
    constructor(
        private readonly apiUrl?: string
    ) {
        if (!apiUrl) {
            this.apiUrl = process.env.API_URL;
        }
    }

    public createRequest (route: RoutesUrls, params = {}): Request {
        const uriParts = route.split(' ');
        if (uriParts.length !== 2) {
            throw new Error(`Invalid route: "${route}"`);
        }

        const method = uriParts[0];
        if (!(method in HttpMethods)) {
            throw new Error(`Invalid method in route: "${route}"`);
        }

        let uri = uriParts[1];
        Object.entries(params).forEach((item) => {
            const re = new RegExp(`(.*):${item[0]}(.*)`);
            uri = uri.replace(re, `$1${item[1]}$2`);
        });

        return {
            uri: this.apiUrl + uri,
            method: method
        };
    }
}