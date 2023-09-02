//Copyright (c) 2023 Fred Juhlin

const { exec } = require('child_process');
const fs = require('fs');

module.exports = function(RED) {
	
    function AXIS_JPEG(config) {
		RED.nodes.createNode(this,config);
		this.resolution = config.resolution;
		this.overlay = config.overlay;
		this.output = config.output;
		var node = this;

		node.on('input', function(msg) {
			var resolution = msg.resolution || node.resolution;
			var items = resolution.split("x");
			var command = "vdo-client -n 1 -t jpeg";
			if( node.overlay === "yes" )
				command += " -O all";
			else
				command += " -O off";
			if( msg.hasOwnProperty("crop") ) {
				command += " -X " + msg.crop.x || 0;
				command += " -Y " + msg.crop.y || 0;
				command += " -W " + msg.crop.w || parseInt(items[0]/2);
				command += " -H " + msg.crop.h || parseInt(items[1]/2);
			}
			command += "  -o /tmp/imgfile.jpg " + items[0] + ' ' + items[1];
			
			exec(command,(error, stdout, stderr) => {
				if (error) {
					node.error("Image error",{payload:error.message});
					return;
				}
				if (stderr) {
					node.error("Image error 2",{payload:stderr});
					return;
				}
				fs.readFile('/tmp/imgfile.jpg', function read(err, data) {
					if( err ) {
						node.warn("Image file error", err );
						return;
					}
					if( node.output === "base64" )
						node.send({topic:"image",payload:data.toString('base64')});
					else
						node.send({topic:"image",payload:data});
				});
			});
		});
    }
	
    RED.nodes.registerType("Camera JPEG",AXIS_JPEG,{
		defaults: {
			resolution: { type:"text" },
			overlay:  { type:"text" },
			output:   { type:"text" }
		}		
	});
}
