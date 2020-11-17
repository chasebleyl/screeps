var utilityEnergy = require('utility.energy');
var roleTransporter = require('role.transporter');
var roleUpgrader = require('role.upgrader');

var roleBuilder = {
    
    build: function(creep) {
        var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
        if(targets.length) {
            var closestSite = creep.pos.findClosestByPath(targets);
            if(creep.build(closestSite) == ERR_NOT_IN_RANGE) {
                creep.moveTo(closestSite, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        } else {
            roleUpgrader.upgrade(creep);
        }
    },
    
    buildSpecificSite: function(creep, room, siteId) {
        // Hash for room isn't working
        var targets = Game.rooms[room].find(FIND_CONSTRUCTION_SITES, {
            filter: (site) => site.id == siteId
        });
        if(targets.length) {
            var closestSite = creep.pos.findClosestByPath(targets);
            if(creep.build(closestSite) == ERR_NOT_IN_RANGE) {
                creep.moveTo(closestSite, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
    },

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.building = false;
        }
        if(!creep.memory.building && creep.store.getFreeCapacity() == 0) {
            creep.memory.building = true;
        }

        if(creep.memory.building) {
            roleBuilder.build(creep);
        }
        else {
            // if (!utilityEnergy.droppedResourceWithdraw(creep)) {
                utilityEnergy.containerWithdraw(creep);
                // if (!utilityEnergy.containerWithdraw(creep)) {
                //     utilityEnergy.sourceWithdraw(creep);
                // }    
            // }
        }
    }
};

module.exports = roleBuilder;