//Copyright (c) 2023 Fred Juhlin

const { spawn } = require('child_process');

module.exports = function(RED) {
	
    function AXIS_Objects(config) {
		RED.nodes.createNode(this,config);
		this.output = "Nothing";
		
		if( parseInt(config.output) === 1 )
			this.output = "detections";
		if( parseInt(config.output) === 2 )
			this.output = "tracker";
		if( parseInt(config.output) === 3 )
			this.output = "path";

		var node = this;
		var predictions = 0;
        const process = spawn("/usr/local/packages/Nodered/nodeobjects",[config.output,config.rotation,config.cog,config.classFilter,config.confidence, predictions]);

		node.status({fill:"green",shape:"dot",text:"Running"});

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
					
					node.send({
						topic: node.output,
						payload:jsonData
					});
				}
			}
        });

        process.on('error', (error) => {
			node.status({fill:"red",shape:"dot",text:"Stopped"});
            node.error("Objects not available",{payload:"Objects service not found"} );
        });

        process.stderr.on('data', (data) => {
            node.error("Objects error",{topic:"Error",payload:data.toString()} );
        });

        process.on('close', (code) => {
			node.status({fill:"red",shape:"dot",text:"Stopped"});
//            node.error("Objects stopped",{payload:'Child process exited with code ' + code });
        });

        node.on('close', (done) => {
			node.status({fill:"red",shape:"dot",text:"Stopped"});
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
