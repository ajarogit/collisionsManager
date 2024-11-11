# Resource Lock Management System

## Overview

This system manages the locking of resources over time. Resources can be locked within specific time intervals. You can check if a resource is locked at a given time, detect collisions (overlapping locks), and manage multiple resources.

## Classes

### 1. **`LockEntry`**
Represents a time-based lock on a resource.
- **Constructor**: `LockEntry(startTime: number, endTime: number)`
- **Methods**:
    - `overlapsWith(other: LockEntry)`: Checks if two locks overlap.
    - `isLessThan(other: LockEntry)`: Compares two locks.

### 2. **`Resource`**
Represents a resource that can have multiple `LockEntry` objects.
- **Constructor**: `Resource(resourceId: string)`
- **Methods**:
    - `addLockEntry(newLockEntry: LockEntry)`: Adds a new lock to the resource.
    - `getResourceStatus(t: number)`: Checks if the resource is locked at time `t`.
    - `findCollisionAtTime(t: number)`: Checks if there's a collision at time `t`.

### 3. **`ResourceLockManager`**
Manages multiple resources and their lock entries.
- **Constructor**: `ResourceLockManager()`
- **Methods**:
    - `isResourceLockedAtTime(resourceId: string, t: number)`: Checks if a resource is locked at time `t`.
    - `findResourceFirstCollision(resourceId: string)`: Finds the first collision for a resource.
    - `parseJson(jsonFilePath: string)`: Loads resource lock data from a JSON file.

## How to Run

The system supports loading lock data from a JSON file using the `ResourceLockManager`. This allows you to programmatically add lock entries to resources in bulk.

### Step 1: Create a JSON File with Lock Data

Create a JSON file that contains an array of records, where each record represents a lock entry for a resource. Each record should be structured as follows:

- **Resource ID** (string - non-empty): The unique identifier of the resource.
- **Start Time** (number - non-negative integer): The start time of the lock (inclusive).
- **End Time** (number - non-negative integer): The end time of the lock (exclusive).

#### Example `lockData.json`

```json
[
  ["Resource1", 10, 20],
  ["Resource1", 18, 25],
  ["Resource1", 30, 40],
  ["Resource1", 35, 45],
  ["Resource2", 5, 15],
  ["Resource2", 20, 30],
  ["Resource2", 25, 35],
  ["Resource3", 15, 25],
  ["Resource3", 10, 20],
  ["Resource3", 30, 40],
  ["Resource4", 0, 10],
  ["Resource4", 10, 15],
  ["Resource4", 25, 35]
]
```

### Step 2: Create `index.ts` to Load JSON and Query Locks

Create an `index.ts` file to load the data from the `data.json` file and query the resource lock status. Below is a detailed example of how to write this file.

#### Example `index.ts`:

```typescript
import { ResourceLockManager } from './ResourceLockManager';

const manager = new ResourceLockManager();

manager.parseJson('path/to/lockData.json');

const isLockedResource1At15 = manager.isResourceLockedAtTime('Resource1', 15);
console.log(`Resource1 at time 15: ${isLockedResource1At15}`);

const hasCollisionResource1At15 = manager.isResourceCollisionAtTime('Resource1', 15);
console.log(`Collision at time 15 for Resource1: ${hasCollisionResource1At15}`);

const firstCollisionResource1 = manager.findResourceFirstCollision('Resource1');
console.log(`First collision for Resource1: ${JSON.stringify(firstCollisionResource1)}`);

const allCollisionsResource2 = manager.findResourceAllCollisions('Resource2');
console.log(`All collisions for Resource2: ${JSON.stringify(allCollisionsResource2)}`);

const isLockedResource3At12 = manager.isResourceLockedAtTime('Resource3', 12);
console.log(`Resource3 at time 12: ${isLockedResource3At12}`);

const firstCollisionResource4 = manager.findResourceFirstCollision('Resource4');
console.log(`First collision for Resource4: ${JSON.stringify(firstCollisionResource4)}`);
```

### Step 3: Running the Project

To run the project:

1. **Ensure your `data.json` file is correctly populated and located at the specified path**:
    - Make sure that the `data.json` file is populated with lock data, following the format described in **Step 2**.
    - The file should be located in the same directory as `index.ts`.

2. **Run `index.ts`**:
    - Execute the `index.ts`

* An example has been added for your convenience in `src/data.json` and `src/index.ts`.


## Notes

- **Logs**:  
  A more robust logging solution should be used instead of console logs.

- **Efficiency**:  
  To improve performance, especially when handling large datasets of lock entries, more advanced algorithms or data structures (e.g., interval trees, segment trees) could be utilized. These would provide faster and more efficient methods for detecting overlaps and managing time intervals. This implementation was not completed due to time constraints.
