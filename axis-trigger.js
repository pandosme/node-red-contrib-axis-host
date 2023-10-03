//Copyright (c) 2023 Fred Juhlin

const { spawn } = require('child_process');

module.exports = function(RED) {
	
    function Axis_Trigger(config) {
		RED.nodes.createNode(this,config);
		this.eventID = config.eventId;
		this.value = config.value;
		this.triggerProcess = 0;
		var node = this;

		node.on('input', function(msg) {
			var eventId = node.eventID;
			var value = node.value || msg.payload;
			var args = [];
			switch( eventId ) {
				case "event":
					if( typeof value === "string" )
						value = parseInt(value);
					if( isNaN(value) ) {
						msg.payload = "Value must be a number";
						node.error("Invlid input",msg);
						return;
					}
					args.push('-t');
					args.push('0');
					args.push('-v');
					args.push(value);
					break;
				case "state":
					if( value === "true" )
						value = 1;
					if( value === "false" )
						value = 0;
					if( typeof value === "string" )
						value = parseInt(value);
					if( value === true )
						value = 1;
					if( value === false )
						value = 0;
					if( isNaN(value) ) {
						msg.payload = "Value must be a boolean";
						node.error("Invlid input",msg);
						return;
					}
					args.push('-t');
					args.push('1');
					args.push('-s');
					args.push(value);
					break;
				case "data":
					if( typeof value === "number" )
						value = value.toString();
					if( typeof value === "object" )
						value = JSON.stringify(value);
					if( typeof value !== "string" ) {
						msg.payload = "Value must be a string";
						node.error("Invlid input",msg);
						return;
					}
					args.push('-t');
					args.push('2');
					args.push('-d');
					args.push('\'' + value + '\'');
					break;
				default:
					node.error("Trigger failed",{payload: eventId + " is not a valid event type"});
					return;
			}
			
			node.triggerProcess = spawn("/usr/local/packages/Nodered/opt/eventcli",args);

			node.triggerProcess.on('error', (error) => {
				node.error("Event Error",{payload:"Unable to locate service"});
			});

			node.triggerProcess.stderr.on('data', (data) => {
				node.error("Event error",{topic:"Error",payload:data.toString()} );
			});

			node.on('close', (done) => {
				if (node.triggerProcess) {
					node.triggerProcess.kill(); // Terminate the child process
				}
				node.triggerProcess = 0;
				done();
			});
		});
    }
	
    RED.nodes.registerType("Trigger",Axis_Trigger,{
		defaults: {
			eventId: { type:"text" },
			value: { type: "text" }
		}				
	});
}
