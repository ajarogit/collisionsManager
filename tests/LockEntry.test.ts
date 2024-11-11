import { LockEntry } from '../src/classes/LockEntry';

describe('LockEntry', () => {

    describe('Constructor', () => {
        it('should throw an error if startTime is greater than or equal to endTime', () => {
            expect(() => new LockEntry(1000, 500)).toThrow('startTime must be less endTime.');
            expect(() => new LockEntry(1000, 1000)).toThrow('startTime must be less endTime.');
        });

        it('should create a valid LockEntry when startTime < endTime', () => {
            const lock = new LockEntry(500, 1000);
            expect(lock.startTime).toBe(500);
            expect(lock.endTime).toBe(1000);
        });

        it('should throw an error if startTime is negative', () => {
            const createLockEntry = () => new LockEntry(-1000, 2000);
            expect(createLockEntry).toThrow('Time values cannot be negative.');
        });

        it('should throw an error if endTime is negative', () => {
            const createLockEntry = () => new LockEntry(1000, -2000);
            expect(createLockEntry).toThrow('Time values cannot be negative.');
        });
    });

    describe('overlapsWith', () => {
        it('should return true when two locks overlap', () => {
            const lock1 = new LockEntry(500, 1000);
            const lock2 = new LockEntry(900, 1100);
            expect(lock1.overlapsWith(lock2)).toBe(true);
        });

        it('should return false when two locks do not overlap', () => {
            const lock1 = new LockEntry(500, 1000);
            const lock2 = new LockEntry(1100, 1200);
            expect(lock1.overlapsWith(lock2)).toBe(false);
        });

        it('should return false when the end of the first lock is equal to the start of the second lock', () => {
            const lock1 = new LockEntry(500, 1000);
            const lock2 = new LockEntry(1000, 1100);
            expect(lock1.overlapsWith(lock2)).toBe(false);
        });

        it('should return true when the start of the first lock is equal to the end of the second lock', () => {
            const lock1 = new LockEntry(500, 1000);
            const lock2 = new LockEntry(400, 500);
            expect(lock1.overlapsWith(lock2)).toBe(false);
        });
    });


    describe('isLessThan', () => {
        it('should return true if the current lock starts earlier than the other lock', () => {
            const lock1 = new LockEntry(500, 1000);
            const lock2 = new LockEntry(600, 1100);
            expect(lock1.isLessThan(lock2)).toBe(true);
        });

        it('should return false if the current lock starts after the other lock', () => {
            const lock1 = new LockEntry(600, 1000);
            const lock2 = new LockEntry(500, 1100);
            expect(lock1.isLessThan(lock2)).toBe(false);
        });

        it('should return true if the start times are the same and the current lock ends earlier', () => {
            const lock1 = new LockEntry(500, 1000);
            const lock2 = new LockEntry(500, 1100);
            expect(lock1.isLessThan(lock2)).toBe(true);
        });

        it('should return false if the start times are the same and the current lock ends later', () => {
            const lock1 = new LockEntry(500, 1100);
            const lock2 = new LockEntry(500, 1000);
            expect(lock1.isLessThan(lock2)).toBe(false);
        });
    });

    describe('Edge Cases', () => {
        it('should handle locks that start and end at the same time correctly', () => {
            const lock1 = new LockEntry(500, 1000);
            const lock2 = new LockEntry(1000, 1100);
            expect(lock1.overlapsWith(lock2)).toBe(false);
        });

        it('should handle locks with a very large time range', () => {
            const lock1 = new LockEntry(1, 1_000_000);
            const lock2 = new LockEntry(500_000, 1_500_000);
            expect(lock1.overlapsWith(lock2)).toBe(true);
        });

        it('should not overlap when a lock ends before the other starts', () => {
            const lock1 = new LockEntry(1000, 2000);
            const lock2 = new LockEntry(3000, 4000);
            expect(lock1.overlapsWith(lock2)).toBe(false);
        });
    });

    describe('Self Comparison', () => {
        it('should return true when a lock is compared with itself using isLessThan', () => {
            const lock1 = new LockEntry(1000, 2000);
            expect(lock1.isLessThan(lock1)).toBe(false);
        });
    });

    describe('Performance', () => {
        it('should correctly handle a large number of locks', () => {
            const locks : LockEntry[] = [];
            for (let i = 0; i < 100000; i++) {
                locks.push(new LockEntry(i * 1000, (i + 1) * 1000));
            }

            expect(locks.length).toBe(100000);
            expect(locks[0].overlapsWith(locks[1])).toBe(false);
            expect(locks[0].overlapsWith(locks[100000 - 1])).toBe(false);
        });
    });
});