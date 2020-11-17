var roleMiner = require('role.miner');
var roleTransporter = require('role.transporter');

var ROLES = {
    harvester: {
        name: 'harvester',
        target: 0,
        body: [WORK,WORK,CARRY,CARRY],
        heavyBody: [WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY],
        directions: [RIGHT,TOP_RIGHT]
    },
    miner: {
        name: 'miner',
        target: 4,
        body: [WORK,WORK,MOVE,MOVE],
        heavyBody: [WORK,WORK,WORK,WORK,WORK,MOVE,MOVE],
        heaviestBody: [WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,MOVE,MOVE],
        directions: [LEFT,BOTTOM_LEFT,TOP_LEFT]
    },
    transporter: {
        name: 'transporter',
        target: 4,
        body: [WORK,CARRY,CARRY,MOVE,MOVE],
        heavyBody: [WORK,WORK,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE],
        heaviestBody: [WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
        directions: [LEFT,BOTTOM_LEFT,TOP_LEFT]
    },
    builder: {
        name: 'builder',
        target: 5,
        body: [WORK,WORK,CARRY,MOVE],
        heavyBody: [WORK,WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE],
        directions: [LEFT,BOTTOM_LEFT,TOP_LEFT]
    },
    upgrader: {
        name: 'upgrader',
        target: 1,
        body: [WORK,WORK,CARRY,MOVE],
        heavyBody: [WORK,WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE],
        directions: [LEFT,BOTTOM_LEFT,TOP_LEFT]
    },
    repairer: {
        name: 'repairer',
        target: 2,
        body: [WORK,CARRY,MOVE,MOVE,MOVE],
        heavyBody: [WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE],
        directions: [LEFT,BOTTOM_LEFT,TOP_LEFT]
    }
}

var recurringRespawn = {
    
    clearDeadCreepMemory: function() {
        for(var i in Memory.creeps) {
            if(!Game.creeps[i]) {
                delete Memory.creeps[i];
            }
        }
    },
    
    getAvailableEnergy: function() {
        return Game.spawns['Spawn1'].room.energyAvailable;  
    },
    
    spawnable: function() {
        Memory.isSpawning = !(Game.spawns['Spawn1'].spawning === null);
        return !Memory.isSpawning && recurringRespawn.getAvailableEnergy() >= 300;
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
    
    spawnCreep: function(role) {
        var creepName = role.name + Math.floor(Math.random() * 1000).toString();
        var attributes;
        if (role.heaviestBody && recurringRespawn.getAvailableEnergy() >= recurringRespawn.calculateBodyEnergyCost(role.heaviestBody)) {
            attributes = role.heaviestBody;
        } else if (role.heavyBody && recurringRespawn.getAvailableEnergy() >= recurringRespawn.calculateBodyEnergyCost(role.heavyBody)) {
            attributes = role.heavyBody;
        } else {
            attributes = role.body;
        }
        var options = {
            directions: role.directions,
            memory: {
                role: role.name
            }
        };
        
        if (role.name == 'miner') {
            var container = roleMiner.assignContainer(Game.spawns['Spawn1']);
            if (!container) {
                return false;
            }
            container.creep = creepName;
            options.memory.container = container;
        } else if (role.name == 'transporter') {
            var container = roleTransporter.assignContainer(Game.spawns['Spawn1']);
            if (!container) {
                return false;
            }
            container.creep = creepName;
            options.memory.container = container;
        }
        
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
    
    attemptCreepSpawn: function(creepType) {
        if (recurringRespawn.spawnable()) {
            var creepCount = recurringRespawn.creepCountByRole(creepType.name);
            if (creepCount < creepType.target) {
                console.log("Attempting creep spawn for type: ", creepType.name);
                return recurringRespawn.spawnCreep(creepType);
            }
        }
        return false;
    },

    /** @param {Creep} creep **/
    run: function() {
        recurringRespawn.clearDeadCreepMemory();

        // Prioritize harvesters/miners
        var harvesterCount = recurringRespawn.creepCountByRole(ROLES.harvester.name);
        if (harvesterCount < ROLES.harvester.target) {
            recurringRespawn.attemptCreepSpawn(ROLES.harvester);
        } else {
            // TODO This is an ASYNC iteration and thus triggers multiple creep spawns
            for (var role in ROLES) {
                if (ROLES.hasOwnProperty(role)) {
                    if (recurringRespawn.attemptCreepSpawn(ROLES[role])) {
                        break;
                    }
                }
            }
        }
    }
};

module.exports = recurringRespawn;