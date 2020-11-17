var minerContainerPositions = [
    "X18Y22",
    "X19Y21",
    "X7Y43",
    "X7Y42"
];



var roleTransporter = {
    assignContainer: function (spawn) {
        var containers = [
            {
                name: "spawnContainer",
                position: new RoomPosition(18, 22, spawn.room.name),
                creep: null
            },
            {
                name: "spawnContainerTwo",
                position: new RoomPosition(19, 21, spawn.room.name),
                creep: null
            }, {
                name: "extensionContainer",
                position: new RoomPosition(7, 43, spawn.room.name),
                creep: null
            }, {
                name: "extensionContainerTwo",
                position: new RoomPosition(7, 42, spawn.room.name),
                creep: null
            }
        ];
        
        for (var creep in Memory.creeps) {
            var creepWithData = Game.creeps[creep];
            if (creepWithData.memory.role == 'transporter' && creepWithData.memory.container != null) {
                var containerIndex = containers.findIndex((container) => container.name == creepWithData.memory.container.name);
                 containers[containerIndex].creep = creep;
            }
        }
        
        var unassignedContainers = _.filter(containers, (container) => container.creep == null);
        
        if (unassignedContainers.length < 1) {
            console.log("ERROR: Tried to assign container to transporter but no containers available for assignment.");
            return false;
        }
        
        return unassignedContainers[0];
    },
    
    harvestEnergy: function(creep) {
         var containers = creep.room.find(FIND_STRUCTURES, { 
            filter: { structureType: STRUCTURE_CONTAINER }
        });
        var targetContainer;
        for (var container of containers) {
            if (container.pos.x == creep.memory.container.position.x && container.pos.y == creep.memory.container.position.y) {
                targetContainer = container;
                break;
            }
        }
        if (!targetContainer) {
            console.log("ERROR: Could not find assigned container for transporter creep.");
            return false;
        }
        
        if (targetContainer.store[RESOURCE_ENERGY] == 0) {
            creep.moveTo(targetContainer.pos.x + 5, targetContainer.pos.y + 5);
            return false;
        } else {
            response = creep.withdraw(targetContainer, RESOURCE_ENERGY);
            if (response != 0) {
                creep.moveTo(targetContainer.pos.x, targetContainer.pos.y, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
        return true;
    },
    
    transferEnergy: function(creep) {
        var targets;
        
        var closestHostile = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestHostile) {
            targets = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (
                    structure.structureType == STRUCTURE_TOWER
                )
            }
        });
        } else {
            targets = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (
                    structure.structureType == STRUCTURE_EXTENSION ||
                    structure.structureType == STRUCTURE_CONTAINER ||
                    structure.structureType == STRUCTURE_TOWER ||
                    structure.structureType == STRUCTURE_SPAWN ||
                    structure.structureType == STRUCTURE_STORAGE) &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0 &&
                    !minerContainerPositions.includes("X" + structure.pos.x + "Y" + structure.pos.y);
            }
        });
        }
        
        
        var closestTarget = creep.pos.findClosestByPath(targets);
        
        resp = creep.transfer(closestTarget, RESOURCE_ENERGY);
        if(resp == ERR_NOT_IN_RANGE) {
            creep.moveTo(closestTarget, {visualizePathStyle: {stroke: '#ffffff'}});
        }
        
        if (creep.store.getCapacity() == creep.store.getFreeCapacity()) {
            creep.memory.isTransferring = false;
        }
    },
    
    // Creep responsible for transporting energy from a harvester 
    // storage unit to other storage units for use across the colony.
    run: function(creep) {
        if (!creep.memory.isTransferring && creep.store.getFreeCapacity() > 0) {
            roleTransporter.harvestEnergy(creep);
        } else {
            creep.memory.isTransferring = true;
            roleTransporter.transferEnergy(creep);
        }
    }
}

module.exports = roleTransporter;