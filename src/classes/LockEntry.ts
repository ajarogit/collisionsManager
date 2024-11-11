/**
 * Represents a lock on a resource defined by a start time and an end time.
 * A lock is considered to occupy the resource from the start time (inclusive)
 * to the end time (exclusive).
 */
export class LockEntry {
    startTime: number;
    endTime: number;

    /**
     * Creates a LockEntry with the given start and end times.
     * This constructor ensures that the interval is valid, meaning that the
     * startTime must be strictly less than the endTime.
     * @param startTime - The start time of the lock (inclusive).
     * @param endTime - The end time of the lock (exclusive).
     *
     * @throws {Error} If the lock times are invalid (i.e., startTime >= endTime).
     */
    public constructor(startTime: number, endTime: number) {
        if (startTime < 0 || endTime < 0) {
            throw new Error('Time values cannot be negative.');
        }

        if (startTime >= endTime) {
            throw new Error('startTime must be less endTime.');
        }

        if (!Number.isInteger(startTime) || !Number.isInteger(endTime)) {
            throw new Error('Time values must be integers.');
        }

        this.startTime = startTime;
        this.endTime = endTime;
    }

    /**
     * Determines whether this lock overlaps with another lock.
     * Two locks overlap if their time intervals intersect.
     *
     * @param other - Another LockEntry to check for overlap.
     * @returns `true` if the locks overlap, `false` otherwise.
     */
    public overlapsWith(other: LockEntry): boolean {
        if (!(other instanceof LockEntry)) {
            throw new Error('The argument must be an instance of LockEntry.');
        }

        return this.startTime < other.endTime && other.startTime < this.endTime;
    }

    /**
     * Compares this lock to another lock to determine which one comes first.
     * Locks are compared first by start time, then by end time if the start times are equal.
     *
     * @param other - Another LockEntry to compare against.
     * @returns `true` if this lock starts before the other lock, or ends before if the start times are the same.
     */
    public isLessThan(other: LockEntry): boolean {
        return this.startTime === other.startTime
            ? this.endTime < other.endTime
            : this.startTime < other.startTime;
    }
}