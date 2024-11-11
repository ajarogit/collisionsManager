import * as fs from 'fs';
import * as path from 'path';

/**
 * Reads the JSON file from the given path.
 * @param jsonFilePath - Path to the JSON file.
 * @returns Parsed JSON data or null if there's an error.
 */
export function readJsonFile(jsonFilePath: string): any[] | null {
    const filePath = path.resolve(jsonFilePath);

    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error instanceof Error) {
            console.log(`Error reading file: ${error.message}`);
        } else {
            console.log("An unknown error occurred.");
        }
        return null;
    }
}
