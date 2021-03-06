var roleMiner = {
    harvest: function(creep, source) {
        if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
            creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
        }
    },

    harvestFromMemory: function(creep) {
        var sources = _.filter(creep.room.find(FIND_SOURCES), i => i.id === creep.memory.sourceId);
        roleMiner.harvest(creep, sources[0]);
    },

    harvestRandomly: function(creep) {
        var sources = creep.room.find(FIND_SOURCES);
        roleMiner.harvest(creep, sources[0]);
    },

    run: function(creep) {
        if (creep.memory.sourceId != null) {
            roleMiner.harvestFromMemory(creep);
        } else {
            if (creep.store.getFreeCapacity() > 0) {
                roleMiner.harvestRandomly(creep);
            }
            else {
                var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_SPAWN ||
                            structure.structureType == STRUCTURE_TOWER) &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
                });
                if(targets.length > 0) {
                    if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                }
            }
        }
    }
};

module.exports = roleMiner;