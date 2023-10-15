//Copyright (c) 2023 Fred Juhlin

const { spawn } = require('child_process');

module.exports = function(RED) {
	
    function AXIS_Objects(config) {
		RED.nodes.createNode(this,config);
		this.version = config.version;
		this.output = config.output;
		this.confidence = config.confidence;
		this.classFilter = config.classFilter;
		this.rotation = config.rotation;
		this.cog = config.cog;
		this.predictions = config.predictions;
		this.idle = config.idle || "0";
		
		var node = this;
		var topic = config.output==="1"?"detections":config.output==="2"?"tracker":"path";

		var path = "/usr/local/packages/Nodered/nodeobjects";
		if( this.version === "2")
			path += "2";
        var process = spawn(path,[node.output,node.rotation,node.cog,node.classFilter,node.confidence, node.predictions, node.idle]);

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
						topic: topic,
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
            node.error("Objects stopped",{payload:'Exit code ' + code });
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
			version: { type:"text" },
			output: { type:"text" },
			classFilter: { type:"text" },
			confidence: { type:"text" },
			rotation: { type:"text" },
			cog: { type:"text" },
			predictions: { type:"text" },
			idle: { type:"text"}
		}		
	});
}
