var buildingController = require('building.controller');

var ROLES = {
    harvester: {
        name: 'harvester',
        target: 2,
        body: [WORK,CARRY,MOVE,MOVE],
        directions: [RIGHT,TOP_RIGHT]
    },
    miner: {
        name: 'miner',
        target: 0,
        body: [WORK,WORK,MOVE,MOVE],
        directions: [LEFT,BOTTOM_LEFT,TOP_LEFT]
    },
    transporter: {
        name: 'transporter',
        target: 0,
        body: [WORK,CARRY,CARRY,MOVE,MOVE],
        directions: [LEFT,BOTTOM_LEFT,TOP_LEFT]
    },
    builder: {
        name: 'builder',
        target: 2,
        body: [WORK,WORK,CARRY,MOVE],
        directions: [LEFT,BOTTOM_LEFT,TOP_LEFT]
    },
    upgrader: {
        name: 'upgrader',
        target: 1,
        body: [WORK,WORK,CARRY,MOVE],
        directions: [LEFT,BOTTOM_LEFT,TOP_LEFT]
    },
    repairer: {
        name: 'repairer',
        target: 0,
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

    spawnHarvester: function(role, sourceId) {
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

    cycle: function() {
        buildingSpawn.clearDeadCreepMemory();

        var roomId = "W42N34";
        var allSources = Game.rooms[roomId].find(FIND_SOURCES);
        for (var i = 0; i < allSources.length; i++) {
            var source = allSources[i];
            var assignedHarvesters = _.filter(Game.creeps, i => i.memory.sourceId === source.id);
            if (
                !buildingSpawn.isSpawning() 
                && assignedHarvesters.length < ROLES.harvester.target
                && buildingSpawn.getAvailableEnergy() >= buildingSpawn.calculateBodyEnergyCost(ROLES.harvester.body) 
            ) {
                console.log("Going to spawn a harvester with sourceId=" + source.id);
                buildingSpawn.spawnHarvester(ROLES.harvester, source.id);
            }
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