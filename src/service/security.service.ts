import { Injectable } from "@nestjs/common";
import * as Base64 from 'crypto-js/enc-base64';
import * as Utf8 from 'crypto-js/enc-utf8';
import * as SHA256 from 'crypto-js/sha256';
import { SecurityException, SecurityExceptionCodes } from "../exceptions/security.exception";
import {addPeriod, toDate} from "../helpers/time.helper";

interface SignatureData {
    userID: string;
    time: Date
}

@Injectable()
export class SecurityService {
    private readonly secret = process.env.API_SECRET;
    private signatureLifeTime = process.env.SIGNATURE_LIFETIME;

    constructor() {
        this.replaceSignatureLifeTime();
    }

    public checkSignature(data: string, signature: string): SignatureData {
        // Check signature payload
        let jsonData;
        try {
            jsonData = Utf8.stringify(Base64.parse(data))
        } catch (e) {
            throw new SecurityException(`Invalid base64 data`, SecurityExceptionCodes.INVALID_BASE64);
        }
        const payload = JSON.parse(jsonData);
        if (!payload || payload['time'] === undefined || payload['user'] === undefined) {
            throw new SecurityException(`Invalid json data`, SecurityExceptionCodes.INVALID_JSON);
        }
        const [timeVal, userID] = [parseInt(payload['time']), payload['user']];
        if (timeVal === 0 || typeof userID !== "string") {
            throw new SecurityException(`Invalid payload data`, SecurityExceptionCodes.INVALID_DATA);
        }
        const time = toDate(timeVal);
        if (addPeriod(this.signatureLifeTime, time) < new Date()) {
            throw new SecurityException(`Signature is expired`, SecurityExceptionCodes.EXPIRED_SIGNATURE);
        }

        // Check signature value
        const secretStr = `<!--time:${timeVal}&secret:${this.secret}&user:${userID}&-->`;
        if (SHA256(secretStr).toString() !== signature) {
            throw new SecurityException(`Signature is expired`, SecurityExceptionCodes.INVALID_SIGNATURE);
        }

        return {
            userID: userID,
            time: time
        };
    }

    private replaceSignatureLifeTime(): void {
        const replacements = {
            sec: 'second',
            min: 'minute',
            h: 'hour',
            d: 'day',
            w: 'week',
            m: 'month',
            y: 'year'
        };
        Object.keys(replacements).forEach(key => {
            const pattern = RegExp(`(\\d+)${key}`);
            if (this.signatureLifeTime.match(pattern)) {
                this.signatureLifeTime = this.signatureLifeTime.replace(pattern, `$1 ${replacements[key]}`);
            }
        });
    }
}