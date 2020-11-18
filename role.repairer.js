var roleRepairer = {
    getRepairTargets: function(creep) {
        return creep.room.find(FIND_STRUCTURES, {
            filter: (object) => {
                return (
                    (object.structureType == STRUCTURE_WALL && object.hits < (object.hitsMax * 0.25))
                    || 
                    (object.structureType != STRUCTURE_WALL && object.hits < (object.hitsMax * 0.80))
                )
            }
        });
    },
    
    tryRepair: function(creep) {
        const targets = roleRepairer.getRepairTargets(creep);
        
        targets.sort((a,b) => a.hits - b.hits);
        
        if (targets.length > 0) {
            var closestStructure = creep.pos.findClosestByPath(targets);
            if(creep.repair(closestStructure) == ERR_NOT_IN_RANGE) {
                creep.moveTo(closestStructure, {visualizePathStyle: {stroke: '#ffffff'}});
                creep.say('🚧 repair');
            }
            return true;
        }
        
        return false;
    },
    
    moveToFlag: function(creep) {
        var flags = creep.room.find(FIND_FLAGS);
        
        if (flags.length < 1) {
            console.log("ERROR: Could not find flag in room for repairer.");
        } else {
            creep.moveTo(flags[0], {visualizePathStyle: {stroke: '#ffffff'}});
            creep.say('move out of the way');
        }
    },

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.repairing && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.repairing = false;
            // creep.say('🔄 harvest');
        }
        if(!creep.memory.repairing && creep.store.getFreeCapacity() == 0) {
            creep.memory.repairing = true;
            // creep.say('🚧 build');
        }

        if(creep.memory.repairing) {
            if (!roleRepairer.tryRepair(creep)) {
                roleRepairer.moveToFlag(creep);
            }
        }
        else {
            var containers = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_CONTAINER) 
                        && (structure.store[RESOURCE_ENERGY] > 0);
                }
            });
            var source = creep.pos.findClosestByPath(containers);
            if (source) {
                if(creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            }
        }
        
        // REPAIRER LOGIC
        
        // if (creep.store.getFreeCapacity() > 0) {
        //     if (!utilityEnergy.containerWithdraw(creep)) {
        //         utilityEnergy.sourceWithdraw(creep);
        //     }
        // } else {
        //     if (!roleRepairer.tryRepair(creep)) {
        //         // roleBuilder.build(creep);
        //         roleUpgrader.upgrade(creep);
        //         // roleRepairer.moveToFlag(creep);
        //     }
        // }
    }
};

module.exports = roleRepairer;