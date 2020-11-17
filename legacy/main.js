var roleHarvester = require('role.harvester');
var roleHarvesterDumper = require('role.harvester.dumper');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleBuilderDistant = require('role.builder.distant');
var recurringRespawn = require('recurring.respawn');
var repairStructures = require('repair.structures');
var roleTransporter = require('role.transporter');
var roleRepairer = require('role.repairer');
var roleMiner = require('role.miner');

module.exports.loop = function () {
    
    recurringRespawn.run();
    
    var towerIds = ['5e54b2e78bfc04245db6b948', '5e478cce673548137d84a756'];
    for (var count in towerIds) {
        var tower = Game.getObjectById(towerIds[count]);
        if (tower) {
            var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if (closestHostile) {
                tower.attack(closestHostile);
            } else {
                var woundedCreeps = _.filter(Game.creeps, (c) => c.hits < c.hitsMax);
                if (woundedCreeps) {
                    tower.heal(woundedCreeps[0]);
                } else {
                    var closestDamagedStructure = tower.pos.findClosestByRange(roleRepairer.getRepairTargets(tower));
                    if (closestDamagedStructure) {
                        tower.repair(closestDamagedStructure);
                    } 
                }
            }
        }
    }

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if(creep.memory.role == 'harvesterDumper') {
            roleHarvesterDumper.run(creep);
        }
        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        if(creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
        if(creep.memory.role == 'builderDistant') {
            roleBuilderDistant.run(creep);
        }
        if(creep.memory.role == 'repairer') {
            roleRepairer.run(creep);
        }
        if(creep.memory.role == 'transporter') {
            roleTransporter.run(creep);
        }
        if(creep.memory.role == 'miner') {
            roleMiner.run(creep);
        }
    }
}