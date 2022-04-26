export const str2Bytes = (str: string): number => {
    const match = str.match(/(\d+)[ ]*(b|B|kb|Kb|KB|kB|mb|Mb|MB|mB|gb|Gb|GB|gB|tb|Tb|TB|tB)/);
    if (match === null) {
        return 0;
    }
    const [size, unit] = [parseInt(match[1]), match[2].toUpperCase()];
    if (size === 0) {
        return 0;
    }

    switch (unit) {
        case 'KB':
            return size * 1024;
        case 'MB':
            return size * 1024 * 1024;
        case 'GB':
            return size * 1024 * 1024 * 1024;
        case 'TB':
            return size * 1024 * 1024 * 1024 * 1024;
        default:
            return size;
    }
};