import { LockEntry } from './LockEntry';


/**
 * Enum that represents the possible states of a resource.
 * Used to indicate whether a resource is currently locked or free.
 */
export enum ResourceStatus {
    FREE = 'FREE',
    LOCKED = 'LOCKED',
}


/**
 * Represents a resource that can have multiple lockEntries.
 * Each lock occupies the resource for a specified time interval.
 * The resource is locked from the start time (inclusive) to the end time (exclusive).
 */
export class Resource {

    resourceId: string;
    locksEntries: LockEntry[];

    /**
     * Creates a resource with the given resource ID.
     * The resource starts with an empty list of locks.
     *
     * @param resourceId - The unique identifier for the resource.
     */
    public constructor(resourceId: string) {
        if (typeof resourceId !== 'string' || resourceId.trim() === '') {
            throw new Error('Resource ID must be a non-empty string.');
        }

        this.resourceId = resourceId
        this.locksEntries = [];
    }

    /**
     * Adds a lock to the resource.
     * @param newLockEntry - A LockEntry object representing the new lock to add.
     */
    public addLockEntry(newLockEntry: LockEntry) {
        if (!(newLockEntry instanceof LockEntry)) {
            throw new Error('The argument must be an instance of LockEntry.');
        }
        // Find the correct insertion index using binary search
        const index = this.findIndexToInsert(newLockEntry);
        // Insert the new lock while keeping the list sorted
        this.locksEntries.splice(index, 0, newLockEntry);
    }

    /**
     * Checks if the resource is locked at a specific time.
     *
     * @param t - The time to check (the time to see if the resource is locked).
     * @returns A string representing the status of the resource ("LOCKED" or "FREE").
     */
    public getResourceStatus(t: number): ResourceStatus {
        if (typeof t !== 'number' || t < 0 || !Number.isInteger(t)) {
            throw new Error('Time must be a non-negative integer.');
        }

        return this.findLockIndexAtTime(t) === -1? ResourceStatus.FREE : ResourceStatus.LOCKED;
    }

    /**
     * Checks if there is a collision (overlap) for the resource at a specific time `t`.
     * A collision occurs if there are two overlapping locks at that time.
     *
     * @param t - The time to check for a collision.
     * @returns `true` if there is a collision, `false` otherwise.
     */
    public findCollisionAtTime(t: number): boolean {
        // Use `findLockIndexAtTime` to get the index of the lock entry covering time `t`
        const lockIndex = this.findLockIndexAtTime(t);

        // If there's no lock at time `t`, there's no collision
        if (lockIndex === -1) {
            return false;
        }

        // Get the current lock entry
        const lockEntry = this.locksEntries[lockIndex];

        // Check the previous and next lock entries for overlap with the current lock entry
        const prevLock = lockIndex > 0 ? this.locksEntries[lockIndex - 1] : null;
        const nextLock = lockIndex < this.locksEntries.length - 1 ? this.locksEntries[lockIndex + 1] : null;

        // Check if the previous lock overlaps with the current one using overlapsWith
        if (prevLock && prevLock.overlapsWith(lockEntry)) {
            return true;
        }

        // Check if the next lock overlaps with the current one using overlapsWith
        if (nextLock && nextLock.overlapsWith(lockEntry)) {
            return true;
        }

        // No collision if no overlaps found
        return false;
    }

    /**
     * Finds all collisions for a given resource, or the first collision depending on the `findAll` flag.
     * A collision is defined as an overlap between two locks.
     *
     * @param findAll - Whether to find all collisions (`true`) or just the first one (`false`).
     * @returns An array of LockEntry pairs if collisions are found, or [] if no collisions are found.
     */
    public findAllCollisions(findAll: boolean = true): LockEntry[][] {
        if (typeof findAll !== 'boolean') {
            throw new Error('findAll must be a boolean value.');
        }

        const collisions: LockEntry[][] = [];

        for (let i = 1; i < this.locksEntries.length; i++) {
            const prevLock = this.locksEntries[i - 1]; // Previous lock
            const currentLock = this.locksEntries[i]; // Current lock

            // Check for overlap between the two locks
            if (prevLock && prevLock.overlapsWith(currentLock)) {
                if (findAll) {
                    collisions.push([prevLock, currentLock]);
                } else {
                    return [[prevLock, currentLock]];  // Early return for the first collision
                }
            }
        }

        //If no collision was found - return an empty array - []
        return collisions
    }

    /**
     * Finds the first collision for this resource.
     * @returns The first LockEntry pair that collides, or `NO_COLLISION_FOUND` if no collision is found.
     */
    public findFirstCollision(): LockEntry[] {
        // Delegate to findCollisions with findAll set to false
        const result = this.findAllCollisions(false)

        return result.length !== 0 ? result[0] : []

    }

    private findIndexToInsert(newLockEntry: LockEntry): number {
        let low = 0;
        let high = this.locksEntries.length;

        // Perform binary search based on both startTime and endTime
        while (low < high) {
            const mid = Math.floor((low + high) / 2);

            // Compare first by startTime, and then by endTime if startTimes are the same
            if (this.locksEntries[mid].isLessThan(newLockEntry)) {
                low = mid + 1;
            } else {
                high = mid;
            }
        }

        return low;
    }

    // Binary search for the first lock that might overlap with time t
    private findLockIndexAtTime(t: number): number {
        let low = 0;
        let high = this.locksEntries.length - 1;

        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            const lockEntry = this.locksEntries[mid];

            if (lockEntry.startTime <= t && lockEntry.endTime > t) {
                return mid;
            }

            if (lockEntry.endTime <= t) {
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }

        return -1;  // Nothing found
    }
}