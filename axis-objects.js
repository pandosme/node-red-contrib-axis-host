//Copyright (c) 2023 Fred Juhlin

const { spawn } = require('child_process');

module.exports = function(RED) {
	
    function AXIS_Objects(config) {
		RED.nodes.createNode(this,config);
		var node = this;

        const process = spawn("/usr/local/packages/Nodered/nodeobjects",[config.output,config.rotation,config.cog,config.classFilter,config.confidence]);

        process.stdout.on('data', (data) => {
			var output = data.toString();
			var rows = output.split("\n");
			for( var i = 0; i < rows.length; i++ ) {
				if( rows[i].length ) {
					var jsonData = null;
					try {
						jsonData = JSON.parse(rows[i]);
					} catch {
						node.error("Parse error",{payload: rows[i]});
						return;
					}
					node.send({payload:jsonData});
				}
			}
        });

        process.on('error', (error) => {
			node.warn(error);
            node.error("Objects not available",{payload:"Objects service not found"} );
        });

        process.stderr.on('data', (data) => {
            node.error("Objects error",{topic:"Error",payload:data.toString()} );
        });

        process.on('close', (code) => {
//            node.error("Objects stopped",{payload:'Child process exited with code ' + code });
        });

        node.on('close', (done) => {
            // Clean up when the node is closed
            if (process) {
                process.kill(); // Terminate the child process
            }
            done();
        });
    }
	
    RED.nodes.registerType("Objects", AXIS_Objects,{
		defaults: {
			output: { type:"text" },
			classFilter: { type:"text" },
			confidence: { type:"text" },
			rotation: { type:"text" },
			cog: { type:"text" }
		}		
	});
}
