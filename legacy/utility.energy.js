/*
Used to prevent extracting resources from containers that should be used exclusively for drop
mining. First, it'll check if the object exists (key is X coordinate of container). If it does,
it'll compare the value (Y coordinate of the container). If there is a match then it will avoid
this container.
*/
var miningContainers = {
    18: 22,
    19: 21,
    7: 42,
    7: 43
};

var utilityEnergy = {
    containerWithdraw: (creep) => {
        var containers = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_STORAGE) 
                    && (structure.store[RESOURCE_ENERGY] > 0) 
                    && !(miningContainers[structure.pos.x] && miningContainers[structure.pos.x] == structure.pos.y);
            }
        });
        var source = creep.pos.findClosestByPath(containers);
        if (source) {
            if(creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
            return true;
        } 
        return false;
    },
    
    spawnWithdraw: (creep) => {
        var spawns = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_SPAWN) && (structure.store[RESOURCE_ENERGY] >= 200);
            }
        });
        var source = creep.pos.findClosestByPath(spawns);
        if (source) {
            if(creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
            return true;
        }
        return false;
    },
    
    droppedResourceWithdraw: (creep) => {
        var droppedResources = creep.room.find(FIND_DROPPED_RESOURCES);
        var source = creep.pos.findClosestByPath(droppedResources);
        if (source) {
            if(creep.pickup(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
            return true;
        }
        return false;
    },
    
    sourceWithdraw: (creep) => {
        var sources = creep.room.find(FIND_SOURCES);
        if(creep.harvest(sources[1]) == ERR_NOT_IN_RANGE) {
            creep.moveTo(sources[1], {visualizePathStyle: {stroke: '#ffaa00'}});
        }
        return true;
    },
    
    optimizedWithdraw: (creep) => {
        if (!utilityEnergy.containerWithdraw(creep)) {
            if (!utilityEnergy.spawnWithdraw(creep)) {
                utilityEnergy.sourceWithdraw(creep);
            }
        }
    }
};


module.exports = utilityEnergy;