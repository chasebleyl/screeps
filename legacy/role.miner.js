var roleMiner = {
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
        
        
        
        for(var creep in Memory.creeps) {
            var creepWithData = Game.creeps[creep];
            if (creepWithData.memory.role == 'miner' && creepWithData.memory.container != null) {
                var containerIndex = containers.findIndex((container) => container.name == creepWithData.memory.container.name);
                containers[containerIndex].creep = creep;
            }
        }
        
        var unassignedContainers = _.filter(containers, (container) => container.creep == null);
        
        if (unassignedContainers.length < 1) {
            console.log("ERROR: Tried to assign container to miner but no containers available for assignment.");
            return false;
        }
        
        return unassignedContainers[0];
        
    },
    
    // a function to run the logic for this role
    run: function (creep) {
        var minerContainer = creep.room.find(FIND_STRUCTURES, {
           filter: (structure) => {
                return (
                    structure.structureType == STRUCTURE_CONTAINER
                    && structure.pos.x == creep.memory.container.position.x
                    && structure.pos.y == creep.memory.container.position.y
                )
           }
        })[0];
        
        // if creep is on top of the container
        if (creep.pos.isEqualTo(minerContainer.pos)) {
            var minerSource = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
            
            // harvest source
            if(creep.harvest(minerSource) == ERR_NOT_IN_RANGE) {
                creep.moveTo(minerSource, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
        
        // if creep is not on top of the flag
        else {
            // move towards it
            creep.moveTo(minerContainer);
        }
    },

};

module.exports = roleMiner;