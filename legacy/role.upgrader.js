var utilityEnergy = require('utility.energy');

var roleUpgrader = {
    
    upgrade: function(creep) {
        if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
        }
    },

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.upgrading = false;
            creep.say('🔄 harvest');
        }
        if(!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
            creep.memory.upgrading = true;
            creep.say('⚡ upgrade');
        }

        if(creep.memory.upgrading) {
            roleUpgrader.upgrade(creep);
        }
        else {
            // if (!utilityEnergy.droppedResourceWithdraw(creep)) {
                if (!utilityEnergy.containerWithdraw(creep)) {
                    utilityEnergy.sourceWithdraw(creep);
                }    
            // }
        }
    }
};

module.exports = roleUpgrader;