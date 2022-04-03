export const getFileExt = (name: string): string | null => {
    const ext = name.match(/^.+\.(\w+)$/);
    return ext ? ext[1] : null;
}

export const base64ToFile = (name: string, size: number, base64Data: string): Express.Multer.File => {
    const ext = getFileExt(name);
    if (ext === null) {
        throw new Error(`Invalid file name "${name}": missed extension`);
    }

    return  {
        fieldname: 'photo',
        originalname: name,
        encoding: 'photo',
        mimetype: `image/${ext}`,
        size: size,
        stream: undefined,
        destination: undefined,
        filename: name,
        path: undefined,
        buffer: Buffer.from(base64Data.replace('data:image/jpeg;base64,', ''), 'base64')
    }
}