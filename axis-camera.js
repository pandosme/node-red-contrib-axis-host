//Copyright (c) 2023 Fred Juhlin

const { spawn } = require('child_process');
const fs = require('fs');

module.exports = function(RED) {
	
    function AXIS_Camera(config) {
		RED.nodes.createNode(this,config);
		this.resolution = config.resolution;
		this.overlay = config.overlay;
		this.channel = config.channel;
		this.output = config.output;
		var node = this;
		var buffers = [];

		node.on('input', function(msg) {

			var resolution = msg.resolution || node.resolution;
			var items = resolution.split("x");
			var width = parseInt( items[0] );
			var height = parseInt( items[1] );
			var overlay = node.overlay === "yes";
			var channel = msg.channel || node.channel;
			var process = null;
			var args = [];
			
			//If crop requested, use vdo-client
			//syntax: vdo-client -n 1 -t jpeg -O all -X 0 -Y 1 -W 100 -H 100 -o /tmp/imgfile.jpg 1920 720
			args.push('-n'); args.push('1');
			args.push('-t'); args.push('jpeg');
			args.push('-O');
			if( overlay ) 
				args.push('all');
			else
				args.push('off');
			args.push('--channel'); args.push(channel);
			if( msg.crop && msg.crop.hasOwnProperty("x") ) {args.push('-X'); args.push(msg.crop.x);}
			if( msg.crop && msg.crop.hasOwnProperty("y") ) {args.push('-Y'); args.push(msg.crop.y);}
			if( msg.crop && msg.crop.hasOwnProperty("w") ) {args.push('-W'); args.push(msg.crop.w);}
			if( msg.crop && msg.crop.hasOwnProperty("h") ) {args.push('-H'); args.push(msg.crop.h);}

			args.push('-o'); args.push("/tmp/imgfile.jpg");
			args.push(width); args.push(height);

			process = spawn("vdo-client",args);
			process.on('close', (code) => {
				fs.readFile('/tmp/imgfile.jpg', function read(err, data) {
					if( err ) {
						node.warn("Image file error", err );
						return;
					}
					if( node.output === "base64" )
						msg.payload = data.toString('base64');
					else
						msg.payload = data;
					node.send(msg);
				});
			});


			process.on('error', (error) => {
				node.error("Camera not available",{payload:"Service not found"} );
			});

			process.stderr.on('data', (data) => {
				node.error("Camera error",{topic:"Error",payload:data.toString()} );
			});
		});
    }
	
    RED.nodes.registerType("Camera",AXIS_Camera,{
		defaults: {
			resolution: { type:"text" },
			overlay:  { type:"text" },
			channel:  { type:"text" },
			output:   { type:"text" }
		}		
	});
}
