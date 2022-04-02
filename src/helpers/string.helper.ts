export const bytesToReadable = (bytes: number, decimals = 2): string => {
    let size = bytes;
    let sizeText: string;
    if (size >= 1073741824) {
        size /= 1073741824;
        sizeText = size.toFixed(decimals).toString() + ' GB';
    } else if (size >= 1048576) {
        size /= 1048576;
        sizeText = size.toFixed(decimals).toString() + ' MB';
    } else if (size >= 1024) {
        size /= 1024;
        sizeText = size.toFixed(decimals).toString() + ' KB';
    } else {
        sizeText = Math.round(size).toString() + ' B';
    }
    return sizeText;
}