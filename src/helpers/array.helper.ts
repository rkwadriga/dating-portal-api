export const inArray = (elem: any, arr: any[]): boolean => {
    return arr.indexOf(elem) !== -1;
}

export const removeElement = (element: any, arr: any[]): number => {
    const index = arr.indexOf(element);
    if (index !== -1) {
        removeByIndex(index, arr);
    }
    return index;
}

export const removeByIndex = (index: number, arr: any[]): void => {
    arr.splice(index, 1);
}