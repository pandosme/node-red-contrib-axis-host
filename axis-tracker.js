//Copyright (c) 2023 Fred Juhlin

const { spawn } = require('child_process');

module.exports = function(RED) {
	
    function AXIS_Tracker(config) {
		RED.nodes.createNode(this,config);
		var node = this;

        const tracker = spawn('/usr/local/packages/Nodered/nodetracker');

        tracker.stdout.on('data', (data) => {
			var output = data.toString();
			try {
				var jsonData = JSON.parse(output);
				node.send({payload:jsonData});
			} catch {
				node.error("Parse error",{payload: output});
				return;
			}
        });

        tracker.on('error', (error) => {
            node.error("Object Tracker not available",{payload:"Unable to locate service"} );
        });

        tracker.stderr.on('data', (data) => {
            node.error("Object Tracker error",{topic:"Error",payload:data.toString()} );
        });

        tracker.on('close', (code) => {
            node.warn("Object Tracker stopped",{payload:'Child process exited with code ' + code });
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
