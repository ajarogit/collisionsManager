import { ResourceLockManager } from './classes/ResourceLockManager';

const manager = new ResourceLockManager();

manager.parseJson('data.json');

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
