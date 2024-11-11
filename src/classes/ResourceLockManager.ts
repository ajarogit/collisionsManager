import { LockEntry } from './LockEntry';
import {Resource, ResourceStatus} from './Resource';
import { readJsonFile } from "../utils/FileUtils";

/**
 * Manages multiple resources and their associated lock entries.
 * This class provides functionality to add lock entries, check for resource collisions,
 * and parse JSON files to load lock data for multiple resources.
 */
export class ResourceLockManager {
    private resources: Map<string, Resource>;

    /**
     * Creates a ResourceLockManager instance, initializing an empty map of resources.
     */
    public constructor() {
        this.resources = new Map<string, Resource>();
    }

    /**
     * Checks if a resource is locked at a specific time.
     * @param resourceId - The ID of the resource to check.
     * @param t - The time to check for a lock.
     * @returns A string representing whether the resource is "LOCKED" or "FREE".
     */
    public isResourceLockedAtTime(resourceId: string, t: number): ResourceStatus {
        // Check if resourceId is a valid, non-empty string
        this.validateResourceId(resourceId);
        this.validateTime(t);

        const resource = this.getResource(resourceId);
        return resource.getResourceStatus(t)
    }

    /**
     * Checks if a resource has a collision (i.e., overlapping lock entries) at a specific time.
     * @param resourceId - The ID of the resource to check.
     * @param t - The time to check for a collision (should be a non-negative integer).
     * @returns `true` if there is a collision at the specified time, `false` otherwise.
     *
     * @throws {Error} If the `resourceId` is invalid or the time `t` is not a non-negative integer.
     */
    public isResourceCollisionAtTime(resourceId: string, t: number): boolean {
        // Check if resourceId is a valid, non-empty string
        this.validateResourceId(resourceId);
        this.validateTime(t)

        const resource = this.getResource(resourceId);
        return resource.findCollisionAtTime(t)
    }

    /**
     * Finds the first collision for a specific resource by ID.
     * @param resourceId - The ID of the resource to check.
     * @returns The first collision pair, or [] if no collision exists.
     */
    public findResourceFirstCollision(resourceId: string): LockEntry[] {
        this.validateResourceId(resourceId);

        const resource = this.getResource(resourceId);
        return resource.findFirstCollision()
    }

    /**
     * Finds all collisions for a specific resource.
     * @param resourceId - The ID of the resource to check.
     * @returns An array of LockEntry pairs if collisions exist, or [] if no collisions exist.
     */
    public findResourceAllCollisions(resourceId: string): LockEntry[][]  {
        this.validateResourceId(resourceId);

        const resource = this.getResource(resourceId);
        return resource.findAllCollisions();
    }

    /**
     * Parses the provided JSON file and processes the lock data for each resource.
     * @param jsonFilePath - The path to the JSON file containing lock data.
     */
    public parseJson(jsonFilePath: string): void {
        const fileData = readJsonFile(jsonFilePath);
        if (!fileData) {
            return;
        }

        fileData.forEach((record: [string, number, number]) => {
            const lockEntry = this.processRecord(record);
            if (lockEntry) {
                this.addLockToResource(record[0], lockEntry);
            }
        });
    }

    /**
     * Processes a single record and creates a LockEntry.
     * @param record - The record to process, which should contain resourceId, startTime, and endTime.
     * @returns A LockEntry if the record is valid; otherwise, returns null.
     */
    private processRecord(record: [string, number, number]): LockEntry | null {
        if (!this.validateRecord(record)) {
            return null;  // Skip invalid records.
        }

        const [, startTime, endTime] = record;
        return new LockEntry(startTime, endTime);
    }

    /**
     * Validates the structure and types of a record.
     * @param record - The record to validate.
     * @returns True if the record is valid, false otherwise.
     */
    private validateRecord(record: [string, number, number]): boolean {
        if (record.length !== 3) {
            console.log(`Skipping invalid record: ${record}`);
            return false;
        }

        const [resourceId, startTime, endTime] = record;

        if (typeof resourceId !== 'string' || typeof startTime !== 'number' || typeof endTime !== 'number') {
            console.log(`Invalid data types in record: ${record}`);
            return false;
        }

        if (startTime >= endTime) {
            console.log(`Invalid time range in record: ${record}`);
            return false;
        }

        return true;
    }

    /**
     * Adds a LockEntry to the appropriate Resource. If the resource doesn't exist, it's created.
     * @param resourceId - The ID of the resource to which the lock entry belongs.
     * @param lockEntry - The LockEntry to add to the resource.
     */
    private addLockToResource(resourceId: string, lockEntry: LockEntry): void {
        let resource = this.resources.get(resourceId);
        if (!resource) {
            resource = new Resource(resourceId);
        }

        resource.addLockEntry(lockEntry);
        this.resources.set(resourceId, resource);
    }

    /**
     * Retrieves or creates a resource by its ID.
     * @param resourceId - The ID of the resource to retrieve or create.
     * @returns The Resource instance.
     */
    private getResource(resourceId: string): Resource {
        if (!this.resources.has(resourceId)) {
            this.resources.set(resourceId, new Resource(resourceId));
        }
        return this.resources.get(resourceId)!;
    }

    private validateResourceId(resourceId: string): void {
        if (typeof resourceId !== 'string' || resourceId.trim() === '') {
            throw new Error('Resource ID must be a non-empty string.');
        }
    }

    private validateTime(t: number): void {
        if (typeof t !== 'number' || t < 0 || !Number.isInteger(t)) {
            throw new Error('Time must be a non-negative integer.');
        }
    }
}
