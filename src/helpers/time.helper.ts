export const DATETIME_FORMAT_PATTERN = /^\d\d\d\d-\d\d-\d\d$/;

export const DATETIME_FULL_FORMAT_PATTERN = /(\w+ \w+ \d+) (\d+) ([\w\d: +\(\)]+)/;

export const DATETIME_FORMAT = 'Y-m-d H:i:s';

export const DATE_FORMAT = 'Y-m-d';

export const monthsNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const toDate = (time: Date | string | number | null): Date => {
    if (typeof time === 'string') {
        return new Date(time);
    } else if (typeof time === 'number') {
        return new Date(time);
    } else if (time === null) {
        return new Date();
    } else {
        return time;
    }
}

export const isDateValid = (date: string, isPast = true): boolean => {
    const matches = date.match(DATETIME_FORMAT_PATTERN);
    if (!matches) {
        return false;
    }

    const checkDate = new Date(date);
    if (!checkDate.getFullYear()) {
        return false;
    }

    return !isPast || checkDate < new Date();
};

export const getDatesDiff = (from: Date | string, to: Date | string | null = null): number => {
    return toDate(to).valueOf() - toDate(from).valueOf();
}

export const yearsFromDate = (date: Date | string | number | null): number => {
    if (date === null) {
        return 0;
    }

    date = toDate(date);
    const now = new Date();
    const yearsDiff = now.getFullYear() - date.getFullYear();
    if (yearsDiff <= 0) {
        return 0;
    }

    const [cMonth, rMonth] = [now.getMonth(), date.getMonth()];
    if (cMonth > rMonth) {
        return yearsDiff;
    }
    if (cMonth < rMonth) {
        return yearsDiff - 1;
    }

    const [cDate, rDate] = [now.getDate(), date.getDate()];
    if (cDate > rDate) {
        return yearsDiff;
    }
    if (cDate < rDate) {
        return yearsDiff - 1;
    }

    const [cHours, rHours] = [now.getHours(), date.getHours()];
    if (cHours > rHours) {
        return yearsDiff;
    }
    if (cHours < rHours) {
        return yearsDiff - 1;
    }

    const [cMinutes, rMinutes] = [now.getMinutes(), date.getMinutes()];
    if (cMinutes > rMinutes) {
        return yearsDiff;
    }
    if (cMinutes < rMinutes) {
        return yearsDiff - 1;
    }

    const [cSeconds, rSeconds] = [now.getSeconds(), date.getSeconds()];
    if (cSeconds >= rSeconds) {
        return yearsDiff;
    }
    return yearsDiff - 1;
}

export const formatDate = (date: Date | string | number | null = null, format: string | null = null): string => {
    date = toDate(date);
    if (format === null) {
        format = DATETIME_FORMAT;
    }

    let result = format;

    if (format.indexOf('Y') !== -1) {
        result = result.replace('Y', date.getFullYear().toString());
    } else if (format.indexOf('y') !== -1) {
        result = result.replace('y', date.getFullYear().toString().substring(2));
    }

    if (format.indexOf('M') !== -1) {
        let month = '';
        switch (date.getMonth()) {
            case 0:
                month = 'January';
                break;
            case 1:
                month = 'February';
                break;
            case 2:
                month = 'March';
                break;
            case 3:
                month = 'April';
                break;
            case 4:
                month = 'May';
                break;
            case 5:
                month = 'June';
                break;
            case 6:
                month = 'July';
                break;
            case 7:
                month = 'August';
                break;
            case 8:
                month = 'September';
                break;
            case 9:
                month = 'October';
                break;
            case 10:
                month = 'November';
                break;
            case 11:
                month = 'December';
                break;
        }
        result = result.replace('M', month);
    } else if (format.indexOf('m') !== -1) {
        const month = date.getMonth() < 9 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1).toString();
        result = result.replace('m', month);
    }

    if (format.indexOf('D') !== -1) {
        let day = '';
        switch (date.getDay()) {
            case 0:
                day = 'Sunday';
                break;
            case 1:
                day = 'Monday';
                break;
            case 2:
                day = 'Tuesday';
                break;
            case 3:
                day = 'Wednesday';
                break;
            case 4:
                day = 'Thursday';
                break;
            case 5:
                day = 'Friday';
                break;
            case 6:
                day = 'Saturday';
                break;
        }
        result = result.replace('D', day);
    } else if (format.indexOf('d') !== -1) {
        const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate().toString();
        result = result.replace('d', day);
    }

    if (format.indexOf('H') !== -1) {
        const hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours().toString();
        result = result.replace('H', hours);
    } else if (format.indexOf('h') !== -1) {
        let hours = '';
        if (date.getHours() === 0) {
            hours = '12 AM';
        } else if (date.getHours() < 12) {
            hours = date.getHours() + ' AM';
        } else if (date.getHours() === 12) {
            hours = '12 PM';
        } else {
            hours = (date.getHours() - 12) + ' PM';
        }
        result = result.replace('h', hours);
    }

    if (format.indexOf('i') !== -1) {
        const minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes().toString();
        result = result.replace('i', minutes);
    }

    if (format.indexOf('s') !== -1) {
        const seconds = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds().toString();
        result = result.replace('s', seconds);
    }

    return result;
}

export const addYears = (years: number, date: Date | string | number | null = null): Date => {
    const stringDate = toDate(date).toString();
    const match = stringDate.match(DATETIME_FULL_FORMAT_PATTERN);
    if (match === null) {
        return addDays(years * 365, date);
    }

    const year = Number(match[2]) + years;
    return new Date(year > 0 ? stringDate.replace(DATETIME_FULL_FORMAT_PATTERN, `$1 ${year} $3`) : null);
}

export const addMonths = (moths: number, date: Date | string | number | null = null): Date => {
    const pattern = /(\w+) \w+ (\d+) \d+ ([\w\d: +\(\)]+)/;
    date = toDate(date);
    const matches = date.toString().match(pattern);
    if (matches === null) {
        return date;
    }

    let [currentYear, currentMoth, yearsDiff, mothsDiff] = [date.getFullYear(), date.getMonth(), 0, 0];
    let newMoths = currentMoth + moths;
    const absMoths = Math.abs(newMoths);
    if (absMoths > 11) {
        currentMoth = 0;
        mothsDiff = absMoths % 12;
        yearsDiff = (absMoths - mothsDiff) / 12;
        if (newMoths < 0) {
            yearsDiff *= -1;
            mothsDiff = 12 - mothsDiff;
        }
    } else if (newMoths < 0) {
        currentMoth = 0;
        yearsDiff = -1;
        mothsDiff = 12 + newMoths;
    } else {
        mothsDiff = moths;
    }

    const [newYear, newMoth] = [currentYear + yearsDiff, monthsNames[currentMoth + mothsDiff]];

    return new Date(date.toString().replace(pattern, `$1 ${newMoth} $2 ${newYear} $3`));
}

export const addDays = (days: number, date: Date | string | number | null = null): Date => {
    return addHours(days * 24, date);
}

export const addHours = (hours: number, date: Date | string | number | null = null): Date => {
    return addMinutes(hours * 60, date);
}

export const addMinutes = (minutes: number, date: Date | string | number | null = null): Date => {
    return addSeconds(minutes * 60, date);
}

export const addSeconds = (seconds: number, to: Date | string | number | null = null): Date => {
    return new Date(toDate(to).valueOf() + seconds * 1000);
}

export const addPeriod = (period: string, to: Date | string | number | null = null): Date => {
    let date = toDate(to);
    const matches = period.toLowerCase().match(/([-]*)[ ]*(\d+)[ ]*(second|minute|hour|day|week|month|year)/);
    if (matches === null) {
        return date;
    }

    let [time, rate] = [parseInt(matches[2]), matches[3]];
    if (matches[1] != '') {
        time = -time;
    }

    switch (rate) {
        case 'second':
            return addSeconds(time, date);
        case 'minute':
            return addMinutes(time, date);
        case 'hour':
            return addHours(time, date);
        case 'day':
            return addDays(time, date);
        case 'week':
            return addDays(time * 7, date);
        case 'month':
            return addMonths(time, date);
        case 'year':
            return addYears(time, date);
    }

    return date;
}