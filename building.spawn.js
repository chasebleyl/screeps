var buildingController = require('building.controller');

var HOME_BASE_ID = "W42N34";
var ROLES = {
    harvester: {
        name: 'harvester',
        target: 0,
        body: [WORK,CARRY,CARRY,MOVE,MOVE],
        directions: [RIGHT,TOP_RIGHT]
    },
    miner: {
        name: 'miner',
        target: 1,
        body: [WORK,WORK,MOVE,MOVE],
        directions: [LEFT,BOTTOM_LEFT,TOP_LEFT]
    },
    transporter: {
        name: 'transporter',
        target: 2,
        body: [WORK,CARRY,CARRY,MOVE,MOVE],
        directions: [LEFT,BOTTOM_LEFT,TOP_LEFT]
    },
    builder: {
        name: 'builder',
        target: 3,
        body: [WORK,WORK,CARRY,MOVE],
        directions: [LEFT,BOTTOM_LEFT,TOP_LEFT]
    },
    upgrader: {
        name: 'upgrader',
        target: 3,
        body: [WORK,CARRY,CARRY,MOVE,MOVE],
        directions: [LEFT,BOTTOM_LEFT,TOP_LEFT]
    },
    repairer: {
        name: 'repairer',
        target: 1,
        body: [WORK,CARRY,MOVE,MOVE,MOVE],
        directions: [LEFT,BOTTOM_LEFT,TOP_LEFT]
    }
};

var buildingSpawn = {
    clearDeadCreepMemory: function() {
        for(var name in Memory.creeps) {
            if(!Game.creeps[name]) {
                delete Memory.creeps[name];
                console.log('Clearing non-existing creep memory:', name);
            }
        }
    },

    getAvailableEnergy: function() {
        return Game.spawns['Spawn1'].room.energyAvailable;  
    },

    isSpawning: function() {
        Memory.isSpawning = !(Game.spawns['Spawn1'].spawning === null);
        return Memory.isSpawning && buildingSpawn.getAvailableEnergy() >= 300;
    },

    creepCountByRole: function(role) {
        return _.sum(Game.creeps, (c) => c.memory.role == role);
    },

    calculateBodyEnergyCost: function(body) {
        var cost = 0;
        for (var element of body) {
            if (element == WORK) {
                cost += 100;
            } else {
                cost += 50;
            }
        }
        return cost;
    },

    spawnCreep: function(role, sourceId = null) {
        var creepName = role.name + Game.time;
        var attributes = role.body;
        var options = {
            directions: role.directions,
            memory: {
                role: role.name,
                sourceId: sourceId
            }
        };
        
        var response = Game.spawns['Spawn1'].spawnCreep( attributes, creepName, options );
        
        switch (response) {
            case 0:
                Memory.isSpawning = true;
                console.log("SUCCESS. Created creep with role: " + role.name);
                return true;
            case -6:
                console.log("ERROR: Attempted Creep spawn, not sufficient energy. Reported available energy: ", Game.spawns['Spawn1'].energyAvailable);
                break;
            case -10:
                console.log("ERROR: Attempted Creep spawn, insufficient body arguments for role " + role.name);
            default:
                console.log("ERROR: Attempted Creep spawn, unknown error: " + response);
                break;
        }
        return false;
    },

    attemptSpawn: function(creepType) {
        console.log("Need to spawn a creep");
        if (!buildingSpawn.isSpawning()) {
            var creepCount = buildingSpawn.creepCountByRole(creepType.name);
            if (creepCount < creepType.target) {
                if (buildingSpawn.getAvailableEnergy() >= buildingSpawn.calculateBodyEnergyCost(creepType.body)) {
                    console.log("Attempting creep spawn for type: ", creepType.name);
                    return buildingSpawn.spawnCreep(creepType);
                }
            }
        }
        return false;
    },

    spawnWithSourceInMemory: function(role) {
        var allSources = Game.rooms[HOME_BASE_ID].find(FIND_SOURCES);
        for (var i = 0; i < allSources.length; i++) {
            var source = allSources[i];
            var assignedCreeps = _.filter(Game.creeps, i => {
                return i.memory.role == role.name && i.memory.sourceId === source.id;
            });
            if (
                !buildingSpawn.isSpawning() 
                && assignedCreeps.length < role.target
                && buildingSpawn.getAvailableEnergy() >= buildingSpawn.calculateBodyEnergyCost(role.body) 
            ) {
                console.log("Going to spawn a " + role.name +" with sourceId=" + source.id);
                return buildingSpawn.spawnCreep(role, source.id);
            }
        }
        return false;
    },

    attemptMinerSpawn: function() {
        var allSources = Game.rooms[HOME_BASE_ID].find(FIND_SOURCES);
        for (var i = 0; i < allSources.length; i++) {
            var source = allSources[i];
            var assignedMiners = _.filter(Game.creeps, i => {
                return i.memory.role == ROLES.miner.name && i.memory.sourceId === source.id;
            });
            if (
                !buildingSpawn.isSpawning() 
                && assignedMiners.length < ROLES.miner.target
                && buildingSpawn.getAvailableEnergy() >= buildingSpawn.calculateBodyEnergyCost(ROLES.miner.body) 
            ) {
                console.log("Going to spawn a miner with sourceId=" + source.id);
                buildingSpawn.spawnCreep(ROLES.miner, source.id);
            }
        }
    },

    attemptHarvesterSpawn: function() {
        var allSources = Game.rooms[HOME_BASE_ID].find(FIND_SOURCES);
        for (var i = 0; i < allSources.length; i++) {
            var source = allSources[i];
            var assignedHarvesters = _.filter(Game.creeps, i => i.memory.sourceId === source.id);
            if (
                !buildingSpawn.isSpawning() 
                && assignedHarvesters.length < ROLES.harvester.target
                && buildingSpawn.getAvailableEnergy() >= buildingSpawn.calculateBodyEnergyCost(ROLES.harvester.body) 
            ) {
                console.log("Going to spawn a harvester with sourceId=" + source.id);
                buildingSpawn.spawnCreep(ROLES.harvester, source.id);
            }
        }
    },

    spawnBasic: function(role) {
        var creepCount = buildingSpawn.creepCountByRole(role.name);
        if (
            !buildingSpawn.isSpawning() 
            && creepCount < role.target
            && buildingSpawn.getAvailableEnergy() >= buildingSpawn.calculateBodyEnergyCost(role.body) 
        ) {
            console.log("Going to spawn a " + role.name);
            return buildingSpawn.spawnCreep(role);
        }
        return false;
    },

    attemptTransporterSpawn: function() {
        var transporterCount = buildingSpawn.creepCountByRole(ROLES.transporter.name);
        if (
            !buildingSpawn.isSpawning() 
            && transporterCount < ROLES.transporter.target
            && buildingSpawn.getAvailableEnergy() >= buildingSpawn.calculateBodyEnergyCost(ROLES.transporter.body) 
        ) {
            console.log("Going to spawn an transporter");
            buildingSpawn.spawnCreep(ROLES.transporter);
        }
    },

    attemptUpgraderSpawn: function() {
        var upgraderCount = buildingSpawn.creepCountByRole(ROLES.upgrader.name);
        if (
            !buildingSpawn.isSpawning() 
            && upgraderCount < ROLES.upgrader.target
            && buildingSpawn.getAvailableEnergy() >= buildingSpawn.calculateBodyEnergyCost(ROLES.upgrader.body) 
        ) {
            console.log("Going to spawn an upgrader");
            buildingSpawn.spawnCreep(ROLES.upgrader);
        }
    },

    attemptBuilderSpawn: function() {
        var builderCount = buildingSpawn.creepCountByRole(ROLES.builder.name);
        if (
            !buildingSpawn.isSpawning() 
            && builderCount < ROLES.builder.target
            && buildingSpawn.getAvailableEnergy() >= buildingSpawn.calculateBodyEnergyCost(ROLES.builder.body) 
        ) {
            console.log("Going to spawn a builder");
            buildingSpawn.spawnCreep(ROLES.builder);
        }
    },

    cycle: function() {
        buildingSpawn.clearDeadCreepMemory();

        if (buildingSpawn.spawnWithSourceInMemory(ROLES.harvester)) {
            console.log("Spawned harvester");
        } else if (buildingSpawn.spawnWithSourceInMemory(ROLES.miner)) {
            console.log("Spawned miner");
        } else if (buildingSpawn.spawnBasic(ROLES.transporter)) {
            console.log("Spawned transporter");
        } else if (buildingSpawn.spawnBasic(ROLES.upgrader)) {
            console.log("Spawned upgrader");
        } else if (buildingSpawn.spawnBasic(ROLES.builder)) {
            console.log("Spawned builder");
        } else if (buildingSpawn.spawnBasic(ROLES.repairer)) {
            console.log("Spawned repairer");
        }

        if (Game.spawns['Spawn1'].spawning) {
            var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
            Game.spawns['Spawn1'].room.visual.text(
                '🛠️' + spawningCreep.memory.role,
                Game.spawns['Spawn1'].pos.x + 1,
                Game.spawns['Spawn1'].pos.y,
                {align: 'left', opacity: 0.8});
        }
    }
};

module.exports = buildingSpawn;