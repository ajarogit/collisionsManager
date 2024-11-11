import { ResourceLockManager } from '../src/classes/ResourceLockManager';
import { ResourceStatus } from '../src/classes/Resource';
import { LockEntry } from '../src/classes/LockEntry';
import * as fs from 'fs';
import * as path from 'path';

jest.mock('fs');
jest.mock('path');


describe('ResourceLockManager', () => {
    let manager: ResourceLockManager;

    beforeEach(() => {
        manager = new ResourceLockManager();
    });

    const addLockEntryToManager = (resourceId: string, startTime: number, endTime: number) => {
        const lockEntry = new LockEntry(startTime, endTime);
        manager['addLockToResource'](resourceId, lockEntry);
    };

    describe('isResourceLockedAtTime', () => {
        it('should return "LOCKED" if the resource is locked at the specified time', () => {
            addLockEntryToManager('resource1', 1000, 2000);
            expect(manager.isResourceLockedAtTime('resource1', 1500)).toBe(ResourceStatus.LOCKED);
        });

        it('should return "FREE" if the resource is not locked at the specified time', () => {
            addLockEntryToManager('resource1', 1000, 2000);
            expect(manager.isResourceLockedAtTime('resource1', 2500)).toBe(ResourceStatus.FREE);
        });

        it('should throw an error for invalid resourceId', () => {
            expect(() => manager.isResourceLockedAtTime('', 1500)).toThrowError('Resource ID must be a non-empty string.');
        });

        it('should throw an error for invalid time', () => {
            expect(() => manager.isResourceLockedAtTime('resource1', -1500)).toThrowError('Time must be a non-negative integer.');
        });
    });

    describe('isResourceCollisionAtTime', () => {
        it('should return true if there is a collision at the specified time', () => {
            addLockEntryToManager('resource1', 1000, 2000);
            addLockEntryToManager('resource1', 1500, 2500);
            expect(manager.isResourceCollisionAtTime('resource1', 1500)).toBe(true);
        });

        it('should return false if there is no collision at the specified time', () => {
            addLockEntryToManager('resource1', 1000, 2000);
            addLockEntryToManager('resource1', 2500, 3500);
            expect(manager.isResourceCollisionAtTime('resource1', 1500)).toBe(false);
        });

        it('should throw an error for invalid resourceId', () => {
            expect(() => manager.isResourceCollisionAtTime('', 1500)).toThrowError('Resource ID must be a non-empty string.');
        });

        it('should throw an error for invalid time', () => {
            expect(() => manager.isResourceCollisionAtTime('resource1', -1500)).toThrowError('Time must be a non-negative integer.');
        });
    });

    describe('findResourceFirstCollision', () => {
        it('should return the first collision pair if a collision exists', () => {
            addLockEntryToManager('resource1', 1000, 2000);
            addLockEntryToManager('resource1', 1500, 2500);
            const result = manager.findResourceFirstCollision('resource1');
            expect(result).toHaveLength(2);
            expect(result[0].startTime).toBe(1000);
            expect(result[1].startTime).toBe(1500);
        });

        it('should return an empty array if no collision exists', () => {
            addLockEntryToManager('resource1', 1000, 2000);
            addLockEntryToManager('resource1', 2500, 3500);
            const result = manager.findResourceFirstCollision('resource1');
            expect(result).toEqual([]);
        });

        it('should throw an error for invalid resourceId', () => {
            expect(() => manager.findResourceFirstCollision('')).toThrowError('Resource ID must be a non-empty string.');
        });
    });

    describe('findResourceAllCollisions', () => {
        it('should return an array of collision pairs if multiple collisions exist', () => {
            addLockEntryToManager('resource1', 1000, 2000);
            addLockEntryToManager('resource1', 1500, 2500);
            addLockEntryToManager('resource1', 2000, 3000);
            const result = manager.findResourceAllCollisions('resource1');
            expect(result).toHaveLength(2);
        });

        it('should return an empty array if no collisions exist', () => {
            addLockEntryToManager('resource1', 1000, 2000);
            addLockEntryToManager('resource1', 2500, 3500);
            const result = manager.findResourceAllCollisions('resource1');
            expect(result).toEqual([]);
        });

        it('should throw an error for invalid resourceId', () => {
            expect(() => manager.findResourceAllCollisions('')).toThrowError('Resource ID must be a non-empty string.');
        });
    });

    describe('parseJson', () => {
        it('should process valid records and add lock entries to resources', () => {
            const jsonData = [
                ['resource1', 1000, 2000],
                ['resource1', 1500, 2500],
                ['resource2', 2000, 3000]
            ];

            jest.spyOn(fs, 'readFileSync').mockReturnValueOnce(JSON.stringify(jsonData));

            jest.spyOn(path, 'resolve').mockReturnValueOnce('mockFilePath');

            const addLockSpy = jest.spyOn(manager as any, 'addLockToResource');

            manager.parseJson('mockFilePath');

            expect(addLockSpy).toHaveBeenCalledTimes(3);
            expect(addLockSpy).toHaveBeenCalledWith('resource1', expect.any(LockEntry));
            expect(addLockSpy).toHaveBeenCalledWith('resource2', expect.any(LockEntry));
        });

        it('should skip invalid records and not add lock entries for them', () => {
            const invalidJsonData = [
                ['resource1', 1000, 2000],
                ['resource2', 'invalid', 3000],
                ['resource3', 1500, 1000],
                ['resource4', 2000, 'invalid']
            ];

            jest.spyOn(fs, 'readFileSync').mockReturnValueOnce(JSON.stringify(invalidJsonData));

            jest.spyOn(path, 'resolve').mockReturnValueOnce('mockFilePath');

            const addLockSpy = jest.spyOn(manager as any, 'addLockToResource');

            manager.parseJson('mockFilePath');

            expect(addLockSpy).toHaveBeenCalledTimes(1);
            expect(addLockSpy).toHaveBeenCalledWith('resource1', expect.any(LockEntry));
        });

        it('should return early if file cannot be read', () => {
            jest.spyOn(fs, 'readFileSync').mockImplementationOnce(() => {
                throw new Error('File not found');
            });

            manager.parseJson('mockFilePath');

            const addLockSpy = jest.spyOn(manager as any, 'addLockToResource');
            expect(addLockSpy).not.toHaveBeenCalled();
        });

        it('should handle empty JSON array correctly', () => {
            const emptyJsonData: any[] = [];

            jest.spyOn(fs, 'readFileSync').mockReturnValueOnce(JSON.stringify(emptyJsonData));

            jest.spyOn(path, 'resolve').mockReturnValueOnce('mockFilePath');

            manager.parseJson('mockFilePath');

            const addLockSpy = jest.spyOn(manager as any, 'addLockToResource');
            expect(addLockSpy).not.toHaveBeenCalled();
        });

        it('should handle malformed JSON gracefully', () => {
            jest.spyOn(fs, 'readFileSync').mockReturnValueOnce('{ "resource": "data", "start": 1000, "end": 2000 ');

            manager.parseJson('mockFilePath');

            const addLockSpy = jest.spyOn(manager as any, 'addLockToResource');
            expect(addLockSpy).not.toHaveBeenCalled();
        });
    });

    describe('addLockToResource', () => {
        it('should add a lock entry to the resource if it doesn\'t already exist', () => {
            addLockEntryToManager('resource1', 1000, 2000);
            const resource = manager['getResource']('resource1');
            expect(resource.locksEntries).toHaveLength(1);
        });

        it('should create a new resource if it doesn\'t exist', () => {
            addLockEntryToManager('resource2', 2000, 3000);
            const resource = manager['getResource']('resource2');
            expect(resource.locksEntries).toHaveLength(1);
        });
    });

    describe('validation methods', () => {
        it('should throw an error for invalid resourceId (empty string)', () => {
            expect(() => manager['validateResourceId']('')).toThrowError('Resource ID must be a non-empty string.');
        });

        it('should throw an error for invalid time (negative value)', () => {
            expect(() => manager['validateTime'](-1)).toThrowError('Time must be a non-negative integer.');
        });

        it('should throw an error for invalid time (non-integer)', () => {
            expect(() => manager['validateTime'](1.5)).toThrowError('Time must be a non-negative integer.');
        });
    });
});

