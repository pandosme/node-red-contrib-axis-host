//Copyright (c) 2025 Fred Juhlin

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
		this.units = config.units;
		this.predictions = config.predictions;
		this.attribute = config.attributes;
		this.idle = parseInt(config.idle) || 0;
		
		var node = this;
		var path = "/usr/local/packages/Nodered/nodeobjects";
		var topic = "path";
		switch( node.output ) {
			case "1": topic = "detections"; break;
			case "2": topic = "tracker"; break;
			case "3": topic = "path"; break;
			default: topic = "undefined"; break;
		}
			
		var restart = true;

		if(node.version === "1" || node.version === "2" || node.version === "4") {
			node.version = "1";
			node.status({fill:"green",shape:"dot",text:"Running"});
			arguments = [node.output,node.confidence, node.rotation, node.cog, node.idle];
		}

		if(node.version === "3") {
			topic = "D2110"
			node.status({fill:"green",shape:"dot",text:"Running"});
			path = "/usr/local/packages/Nodered/D2110";
			arguments = [node.units];
		}

		var process = spawn(path,arguments);


        process.stdout.on('data', (data) => {
			var output = data.toString();
			var rows = output.split("\n");
			for( var i = 0; i < rows.length; i++ ) {
				if( rows[i].length ) {
					var someObject = null;
					try {
						someObject = JSON.parse(rows[i]);
					} catch {
						node.error("Parse error:" + rows[i]);
						return;
					}

					if( node.version === "3" ) {
						node.send({
							topic: "radar",
							payload:someObject
						});
						continue;
					}
					if( someObject ) {
						node.send({
							topic: topic,
							payload:someObject
						});
					}
				}
			}
        });

		process.on('error', (error) => {
			clearInterval(node.refreshTrackers);
			node.status({fill:"red",shape:"dot",text:"Stopped"});
			node.error("Objects not available", error);
		});

        process.stderr.on('data', (data) => {
            node.error("Objects error",{topic:"Error",payload:data.toString()} );
        });

        process.on('close', (code) => {
			if( restart ) {
				setTimeout(function(){
					if( node.version === "1" || node.version === "2" || node.version === "4") {
						process = spawn(path,arguments);
						node.error("Objects restarted",{payload:'Process exited with code ' + code });
					}
					if( node.version === "3") {
						process = spawn(path,arguments);
						node.error("Objects restarted",{payload:'Process exited with code ' + code });
					}
				},2000);
			}
        });

		node.on('close', (done) => {
			restart = false;
			clearInterval(node.refreshTrackers); // Add this
			node.status({fill:"red",shape:"dot",text:"Stopped"});
			if (process) {
				process.kill();
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
			units: { type:"text" },
			idle: { type:"text"}
		}		
	});
}
