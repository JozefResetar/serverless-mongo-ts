export * from "./message";
export * from "./transform";

export const streamToString = (stream): Promise<string> => new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
});

export const mapToObject = (myMap) => {
    const myObj: {[key: string]: {[subKey: string]: unknown[]}} = {};
    for (let [key, subMap] of myMap) {
        myObj[key] = {};
        for (let [subkey, valueArray] of subMap) {
            myObj[key][subkey] = valueArray;
        }
    }
    return myObj;
}