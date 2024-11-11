import { Resource, ResourceStatus } from '../src/classes/Resource';
import { LockEntry } from '../src/classes/LockEntry';

describe('Resource Class', () => {
    let resource: Resource;

    beforeEach(() => {
        resource = new Resource('resource1');
    });

    describe('addLockEntry', () => {
        it('should add a lock entry to the resource', () => {
            const lock = new LockEntry(1000, 2000);
            resource.addLockEntry(lock);
            expect(resource.locksEntries.length).toBe(1);
            expect(resource.locksEntries[0].startTime).toBe(1000);
            expect(resource.locksEntries[0].endTime).toBe(2000);
        });

        it('should add multiple lock entries and keep them sorted by start time', () => {
            const lock1 = new LockEntry(1000, 2000);
            const lock2 = new LockEntry(1500, 2500);
            const lock3 = new LockEntry(2000, 3000);

            resource.addLockEntry(lock1);
            resource.addLockEntry(lock2);
            resource.addLockEntry(lock3);

            expect(resource.locksEntries[0].startTime).toBe(1000);
            expect(resource.locksEntries[1].startTime).toBe(1500);
            expect(resource.locksEntries[2].startTime).toBe(2000);
        });

        it('should throw an error if the argument is not an instance of LockEntry', () => {
            const invalidLock = () => resource.addLockEntry({} as any);
            expect(invalidLock).toThrow('The argument must be an instance of LockEntry.');
        });

        it('should throw an error for invalid lock entries (startTime >= endTime)', () => {
            const invalidLock = () => new LockEntry(2000, 1000);
            expect(invalidLock).toThrow('startTime must be less endTime.');
        });

        it('should reject adding a lock with invalid types for startTime and endTime', () => {
            const invalidLock = () => new LockEntry('1000' as any, '2000' as any);
            expect(invalidLock).toThrow('Time values must be integers.');
        });

        it('should reject empty or invalid resourceId when adding a lock', () => {
            const invalidResource = () => {
                const emptyResource = new Resource('');
                emptyResource.addLockEntry(new LockEntry(1000, 2000));
            };
            expect(invalidResource).toThrow('Resource ID must be a non-empty string.');
        });
    });

    describe('findAllCollisions', () => {
        it('should detect collisions when two locks overlap', () => {
            const lock1 = new LockEntry(1000, 2000);
            const lock2 = new LockEntry(1500, 2500);
            resource.addLockEntry(lock1);
            resource.addLockEntry(lock2);

            const collisions = resource.findAllCollisions();
            expect(collisions).toEqual([[lock1, lock2]]);
        });

        it('should detect multiple collisions and return all of them', () => {
            const lock1 = new LockEntry(1000, 2000);
            const lock2 = new LockEntry(1500, 2500);
            const lock3 = new LockEntry(2000, 3000);
            const lock4 = new LockEntry(3500, 4500);

            resource.addLockEntry(lock1);
            resource.addLockEntry(lock2);
            resource.addLockEntry(lock3);
            resource.addLockEntry(lock4);

            const collisions = resource.findAllCollisions();
            expect(collisions).toEqual([
                [lock1, lock2],
                [lock2, lock3],
            ]);
        });

        it('should return only the first collision when findAll is false', () => {
            const lock1 = new LockEntry(1000, 2000);
            const lock2 = new LockEntry(1500, 2500);
            const lock3 = new LockEntry(2000, 3000);
            resource.addLockEntry(lock1);
            resource.addLockEntry(lock2);
            resource.addLockEntry(lock3);

            const collision = resource.findAllCollisions(false);
            expect(collision).toEqual([[lock1, lock2]]);
        });

        it('should return an empty array if no collisions are found', () => {
            const lock1 = new LockEntry(1000, 2000);
            const lock2 = new LockEntry(3000, 4000);
            resource.addLockEntry(lock1);
            resource.addLockEntry(lock2);

            const collisions = resource.findAllCollisions();
            expect(collisions).toEqual([]);
        });
    });

    describe('getResourceStatus', () => {
        it('should return LOCKED if the resource is locked at a specific time', () => {
            const lock = new LockEntry(1000, 2000);
            resource.addLockEntry(lock);

            const statusAt1500 = resource.getResourceStatus(1500);
            expect(statusAt1500).toBe(ResourceStatus.LOCKED);
        });

        it('should return FREE if the resource is not locked at a specific time', () => {
            const lock = new LockEntry(1000, 2000);
            resource.addLockEntry(lock);

            const statusAt2500 = resource.getResourceStatus(2500);
            expect(statusAt2500).toBe(ResourceStatus.FREE);
        });

        it('should return LOCKED if multiple locks overlap at the same time', () => {
            const lock1 = new LockEntry(1000, 2000);
            const lock2 = new LockEntry(1500, 2500);
            resource.addLockEntry(lock1);
            resource.addLockEntry(lock2);

            const statusAt1600 = resource.getResourceStatus(1600);
            expect(statusAt1600).toBe(ResourceStatus.LOCKED);
        });

        it('should return FREE when no locks cover the requested time', () => {
            const statusAt5000 = resource.getResourceStatus(5000);
            expect(statusAt5000).toBe(ResourceStatus.FREE);
        });

        it('should throw an error for invalid time (negative or non-integer)', () => {
            const invalidTime = () => resource.getResourceStatus(-1);
            expect(invalidTime).toThrow('Time must be a non-negative integer.');
        });
    });

    describe('findCollisionAtTime', () => {
        it('should detect a collision when two locks overlap at a specific time', () => {
            const lock1 = new LockEntry(1000, 2000);
            const lock2 = new LockEntry(1500, 2500);
            resource.addLockEntry(lock1);
            resource.addLockEntry(lock2);

            const collision = resource.findCollisionAtTime(1500);
            expect(collision).toBe(true);
        });

        it('should detect a non collision when the overlap occurs at the boundary time (endTime of lock1 and startTime of lock2)', () => {
            const lock1 = new LockEntry(1000, 2000);
            const lock2 = new LockEntry(2000, 3000);
            resource.addLockEntry(lock1);
            resource.addLockEntry(lock2);

            const collision = resource.findCollisionAtTime(2000);
            expect(collision).toBe(false);
        });

        it('should detect a collision when two locks overlap at the startTime of one and endTime of another', () => {
            const lock1 = new LockEntry(1000, 2000);
            const lock2 = new LockEntry(1500, 2500);
            resource.addLockEntry(lock1);
            resource.addLockEntry(lock2);

            const collision = resource.findCollisionAtTime(1500);
            expect(collision).toBe(true);
        });

        it('should not detect a collision when no locks overlap at a specific time', () => {
            const lock1 = new LockEntry(1000, 2000);
            const lock2 = new LockEntry(3000, 4000);
            resource.addLockEntry(lock1);
            resource.addLockEntry(lock2);

            const collision = resource.findCollisionAtTime(2500);
            expect(collision).toBe(false);
        });

        it('should not detect a collision if a lock does not cover the given time', () => {
            const lock1 = new LockEntry(1000, 2000);
            const lock2 = new LockEntry(3000, 4000);
            resource.addLockEntry(lock1);
            resource.addLockEntry(lock2);

            const collision = resource.findCollisionAtTime(5000);
            expect(collision).toBe(false);
        });

        it('should return false if no locks exist in the resource when calling findCollisionAtTime', () => {
            const collision = resource.findCollisionAtTime(1500);
            expect(collision).toBe(false);
        });

        it('should handle edge case where locks start at the same time', () => {
            const lock1 = new LockEntry(1000, 2000);
            const lock2 = new LockEntry(1000, 2500);
            resource.addLockEntry(lock1);
            resource.addLockEntry(lock2);

            const collision = resource.findCollisionAtTime(1000);
            expect(collision).toBe(true);
        });

        it('should handle edge case where locks end at the same time', () => {
            const lock1 = new LockEntry(1000, 2000);
            const lock2 = new LockEntry(1500, 2000);
            resource.addLockEntry(lock1);
            resource.addLockEntry(lock2);

            const collision = resource.findCollisionAtTime(2000);
            expect(collision).toBe(false);
        });
    });


    describe('Helper Methods', () => {
        it('should insert locks in the correct order using findIndexToInsert', () => {
            const lock1 = new LockEntry(1000, 2000);
            const lock2 = new LockEntry(1500, 2500);
            const lock3 = new LockEntry(1200, 2200);

            resource.addLockEntry(lock1);
            resource.addLockEntry(lock2);

            resource.addLockEntry(lock3);
            expect(resource.locksEntries[1]).toEqual(lock3);
        });
    });

    describe('findFirstCollision', () => {
        it('should return the first collision between two overlapping locks', () => {
            const lock1 = new LockEntry(1000, 2000);
            const lock2 = new LockEntry(1500, 2500);
            const lock3 = new LockEntry(2000, 3000);
            resource.addLockEntry(lock1);
            resource.addLockEntry(lock2);
            resource.addLockEntry(lock3);

            const firstCollision = resource.findFirstCollision();
            expect(firstCollision).toEqual([lock1, lock2]);
        });

        it('should return [] if no collisions exist', () => {
            const lock1 = new LockEntry(1000, 2000);
            const lock2 = new LockEntry(3000, 4000);
            resource.addLockEntry(lock1);
            resource.addLockEntry(lock2);

            const firstCollision = resource.findFirstCollision();
            expect(firstCollision).toEqual([]);
        });

        it('should return the first collision when multiple collisions exist', () => {
            const lock1 = new LockEntry(1000, 2000);
            const lock2 = new LockEntry(1500, 2500);
            const lock3 = new LockEntry(2000, 3000);
            const lock4 = new LockEntry(3500, 4500);

            resource.addLockEntry(lock1);
            resource.addLockEntry(lock2);
            resource.addLockEntry(lock3);
            resource.addLockEntry(lock4);

            const firstCollision = resource.findFirstCollision();
            expect(firstCollision).toEqual([lock1, lock2]);
        });
    });

});
