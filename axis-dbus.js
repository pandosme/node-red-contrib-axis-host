//Copyright (c) 2023 Fred Juhlin

const { spawn } = require('child_process');

module.exports = function(RED) {
	
    function AXIS_DBus(config) {
		RED.nodes.createNode(this,config);
		this.group = config.group;		
		var node = this;

		var monitor = "monitor";
		if( this.group.length )
			monitor += " " + this.group;
		console.log(monitor);
		const busCTLProcess = spawn('busctl', [monitor, '-j']);
        busCTLProcess.stdout.on('data', (data) => {
            var output = data.toString();
			var items = output.split('\n');
			for( var i = 0; i < items.length; i++ ) {
				var jsonData = null;
				try {
					jsonData = JSON.parse(item[i]);
				} catch {
					node.error("Parse error",{payload: item[i]});
					return;
				}
				node.send({payload: jsonData});
			}
        });

        busCTLProcess.on('error', (error) => {
            node.error("DBus failed",error );
        });

        busCTLProcess.stderr.on('data', (data) => {
            node.error("DBus failed",{topic:"Error",payload: data.toString()} );
        });

        busCTLProcess.on('close', (code) => {
            node.error("DBus failed",{topic:"Error",payload: code} );
        });

        node.on('close', (done) => {
            // Clean up when the node is closed
            if (busCTLProcess) {
                busCTLProcess.kill(); // Terminate the child process
            }
            done();
        });
    }
	
    RED.nodes.registerType("Device DBus",AXIS_DBus,{
		defaults: {
			group: { type:"text" }
		}		
	});
}
