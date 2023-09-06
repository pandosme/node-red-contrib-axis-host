//Copyright (c) 2023 Fred Juhlin

const { spawn, exec } = require('child_process');

module.exports = function(RED) {
	
    function AXIS_Event_Out(config) {
		RED.nodes.createNode(this,config);
		this.eventID = config.eventId;
		var node = this;

        const eventdeclare = spawn('/usr/local/packages/Nodered/eventdeclare');

        eventdeclare.stdout.on('data', (data) => {
			
			node.send({payload: data});
        });

        eventdeclare.on('error', (error) => {
            node.error("Event Out not available",{payload:"No event declare service found"} );
        });

        eventdeclare.stderr.on('data', (data) => {
            node.error("Event out error",{topic:"Error",payload:data.toString()} );
        });

        eventdeclare.on('close', (code) => {
            node.error("Event Out stopped", {payload:"Child process exited with code " + code});
        });

        node.on('close', (done) => {
            // Clean up when the node is closed
            if (eventlistner) {
                eventlistner.kill(); // Terminate the child process
            }
            done();
        });

		node.on('input', function(msg) {
			var eventId = node.EventId;
			var value = node.value || msg.payload;

			var command = "/usr/local/packages/Nodered/";
			command += "eventfire -i 1 -v " + value;
			
			exec(command,(error, stdout, stderr) => {
				if (error) {
					node.error("Event out failed",{payload:error.message});
					return;
				}
				if (stderr) {
					node.error("Event Out failed",{payload:stderr});
					return;
				}
				node.send({payload: "OK"});
			});
		});
    }
	
    RED.nodes.registerType("Event Out",AXIS_Event_Out,{
		defaults: {
		}		
	});
}
