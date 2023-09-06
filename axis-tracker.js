//Copyright (c) 2023 Fred Juhlin

const { spawn } = require('child_process');

module.exports = function(RED) {
	
    function AXIS_Tracker(config) {
		RED.nodes.createNode(this,config);
		var node = this;

        const tracker = spawn('/usr/local/packages/Nodered/nodetracker');

        tracker.stdout.on('data', (data) => {
			var declarationsID = data.toString().split("\n");
			node.send({payload:declarationsID});
        });

        tracker.on('error', (error) => {
            node.error("Tracker not avaialble",{payload:"Service not found"} );
        });

        tracker.stderr.on('data', (data) => {
            node.error("Tracker error",{topic:"Error",payload:data.toString()} );
        });

        tracker.on('close', (code) => {
            node.error("Tracker stopped",{payload:'Process exited with code ' + code);
        });

        node.on('close', (done) => {
            // Clean up when the node is closed
            if (tracker) {
                tracker.kill(); // Terminate the child process
            }
            done();
        });
    }
	
    RED.nodes.registerType("Object Tracker", AXIS_Tracker,{
		defaults: {}		
	});
}
