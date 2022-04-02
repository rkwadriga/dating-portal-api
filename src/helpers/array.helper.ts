export const inArray = (elem: any, arr: any[]): boolean => {
    let result = false;
    arr.some(item => {
        if (item === elem) {
            return result = true;
        }
    });
    return result;
}