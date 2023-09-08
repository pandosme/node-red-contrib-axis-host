//Copyright (c) 2023 Fred Juhlin

const { spawn } = require('child_process');

module.exports = function(RED) {
	
    function AXIS_Objects(config) {
		RED.nodes.createNode(this,config);
		var node = this;

		var command = "/usr/local/packages/Nodered/nodeobjects";
		command += " " + config.output;
		command += " " + config.rotation;
		command += " " + config.cog;
		command += " " + config.classFilter;
		command += " " + config.confidence;		

		console.log(command);

        const process = spawn(command);

        process.stdout.on('data', (data) => {
			var output = data.toString();
			var rows = output.split("\n");
			for( var i = 0; i < rows.length; i++ ) {
				try {
					var jsonData = JSON.parse(rows[i]);
					node.send({payload:jsonData});
				} catch {
					node.error("Parse error",{payload: rows[i]});
					return;
				}
			}
        });

        process.on('error', (error) => {
            node.error("Objects not available",{payload:"Objects service not found"} );
        });

        process.stderr.on('data', (data) => {
            node.error("Objects error",{topic:"Error",payload:data.toString()} );
        });

        process.on('close', (code) => {
            node.warn("Objects stopped",{payload:'Child process exited with code ' + code });
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
