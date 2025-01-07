//Copyright (c) 2025 Fred Juhlin

const { spawn } = require('child_process');

const humanColors = ["White", "Gray", "Black", "Red", "Blue", "Green", "Yellow", "Beige", "Color_Human 1", "Color_Human_2"];
const vehicleColorsVersion1 = ["White", "Gray", "Black", "Red", "Blue", "Green", "Yellow", "Color_Vehicle_1", "Color_Vehicle_2"];

function processDetection( detection ) {
	if(detection.hasOwnProperty("attributes")) {
		detection.attributes.forEach(function(attribute){
			switch( attribute.type) {
				case 0:
					break;
				case 1:
					break;
				case 2: //Vehicle color
					detection.color = vehicleColorsVersion1[attribute.value];
					break;
				case 3: //Upper color;
					detection.color = humanColors[attribute.value];
					break;
				case 4: //Lower color;
					detection.color2 = humanColors[attribute.value];
					break;
				case 5: //Bag type
					switch( attribute.value ) {
						case 0: detection.class = "Bag"; break;
						case 1: detection.class = "Backpack"; break;
						case 2: detection.class = "Suitecase"; break;
						default: detection.class = "Bag"; break;
					}
					break;
				case 6: //Hat type 
					switch(attribute.value) {
						case 0:
							detection.hat = false;
							break;
						case 1:
							detection.hat = "Hat";
							break;
						case 2:
							detection.hat = "Helmet";
							break;
						default:
							detection.hat = "Other";
							break;
					}
					break;
					case 7: //human_face_visibility
						if( attribute.value === 0 ) detection.face = false;
						if( attribute.value === 1 ) detection.face = true;
					break;
				case 8:
					detection.vehicle = true;
					switch( attribute.value ) {
						case 0: detection.class = "Car"; break;
						case 1: detection.class = "Truck"; break;
						case 2: detection.class = "Buss"; break;
						case 3: detection.class = "Vehicle"; break;
						case 4: detection.class = "Vehicle4"; break;
						case 5: detection.class = "Vehicle5"; break;
						case 6: detection.class = "Vehicle6"; break;
						case 7: detection.class = "Vehicle7"; break;
						default: detection.class = "Vehicle8"; break;
					}
					break;
				case 9:
					break;
				case 10:
					break;
			}
		});
	}
	if( detection.class === "vehicle") { detection.class = "Vehicle"; return detection;}
	if( detection.class === "human") { detection.class = "Human"; return detection;}
	if( detection.class === "human_head") { detection.class = "Head"; return detection;}
	if( detection.class === "motorcycle_bicycle") { detection.class = "Bike"; return detection;}
	if( detection.class === "bag") { detection.class = "Bag"; return detection;}	
	if( detection.class === "animal") { detection.class = "Animal"; return detection;}
	if( detection.class === "face") { detection.class = "Head"; return detection;}
	if( detection.class === "human_face") { detection.class = "Head"; return detection;}
	if( detection.class === "license_plate") { detection.class = "LicensePlate"; return detection;}	
	
	return detection;
}

function processPath( tracker, node ) {
	if( !node.hasOwnProperty("paths") )
		node.paths = {};
	var paths = node.paths;
	var tracker = processDetection( tracker, node );
	if( !tracker || !tracker.hasOwnProperty("id") ) {
		console.log(tracker);
		return null;
	}
	if( !paths.hasOwnProperty(tracker.id) ) {
		paths[tracker.id] = {
			id: tracker.id,
			confidence: tracker.confidence,
			class: tracker.class,
			timestamp: tracker.birth,
			age: tracker.age,
			dx: tracker.dx,
			dy: tracker.dy,
			distance: tracker.distance,
			sampletime: tracker.timestamp,
			dwell: 0,
			color: tracker.color || false,
			color2: tracker.color2 || false,
			hat: tracker.hat || false,
			face: tracker.face || false,
			path:[
				{
					x: tracker.cx,
					y: tracker.cy,
					d: 0
				}
			]
		}
	} else {
		paths[tracker.id].confidence = tracker.confidence;
		paths[tracker.id].class = tracker.class;
		paths[tracker.id].age = tracker.age;
		paths[tracker.id].dx = tracker.dx;
		paths[tracker.id].dy = tracker.dy;
		paths[tracker.id].distance = tracker.distance;
		paths[tracker.id].velocity = tracker.distance / tracker.age;
		paths[tracker.id].velocity = tracker.topVelocity;
		paths[tracker.id].color = tracker.color || false;
		paths[tracker.id].color2 = tracker.color2 || false;
		paths[tracker.id].hat = tracker.hat || false;
		paths[tracker.id].face = tracker.face || false;
		var duration = (tracker.timestamp - paths[tracker.id].sampletime) / 1000;
		if( duration > paths[tracker.id].dwell )
			paths[tracker.id].dwell = duration;
		paths[tracker.id].sampletime = tracker.timestamp;
		paths[tracker.id].path[paths[tracker.id].path.length-1].d = duration;
		paths[tracker.id].path.push({
			x: tracker.x,
			y: tracker.y,
			d: 0
		});
	}

	if( tracker.active !== false )
		return null;

	if( paths[tracker.id].age < 1.0 || paths[tracker.id].path.length < 2 ) {
		delete paths[tracker.id];
		return null;
	}
	var path = paths[tracker.id];
	delete paths[tracker.id];
	return path;
}

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

		var restart = true;

		if(node.version === "1" || node.version === "2" || node.version === "4") {
			node.version = "1";
			path = "/usr/local/packages/Nodered/nodeobjects";			
			node.status({fill:"green",shape:"dot",text:"Running"});
			arguments = [node.output,node.confidence, node.rotation, node.cog];
		}

		if(node.version === "3") {
			topic = "D2110"
			node.status({fill:"green",shape:"dot",text:"Running"});
			path = "/usr/local/packages/Nodered/D2110";
			arguments = [node.units];
		}

		var process = spawn(path,arguments);

		node.refreshTrackers = setInterval(() => {
			if( !this.trackers )
				return;
			for( var tracker in this.trackers ) {
				if( this.trackers[tracker].active === false ) {
					delete this.trackers[tracker];
					continue;
				}
					
				var secondsSinceLastPublish = (new Date().getTime() - this.trackers[tracker].timestamp) / 1000;
				if( secondsSinceLastPublish > 3 ) {
					this.trackers[tracker].age = Math.round((new Date().getTime() - this.trackers[tracker].birth) / 100) / 10;
					this.trackers[tracker].timestamp = new Date().getTime();
					if( this.trackers[tracker].age > this.idle ) {
						this.trackers[tracker].active = false;
						node.send({
							topic: "tracker",
							payload:this.trackers[tracker]
						});
						continue;
					}
					node.send({
						topic: "tracker",
						payload:this.trackers[tracker]
					});
				}
			}
			// Your code here
		}, 1000); 

        process.stdout.on('data', (data) => {
			var output = data.toString();
			var rows = output.split("\n");
			for( var i = 0; i < rows.length; i++ ) {
				if( rows[i].length ) {
					var someObject = null;
					try {
						someObject = JSON.parse(rows[i]);
					} catch {
						node.error("Parse error",rows[i]);
						return;
					}

					if( node.version === "3" ) {
						node.send({
							topic: "radar",
							payload:someObject
						});
						continue;
					}
					var topic = "Unprocessed";
					if( node.output === "1" ) {
						topic = "detections";
						someObject.forEach(function(item) {
							item = processDetection( item );
						});
					}
					if( node.output === "2" ) {
						topic = "tracker";
						someObject = processDetection( someObject );
						if( !node.hasOwnProperty("trackers") )
							node.trackers = {};
						if( someObject.active )
							node.trackers[someObject.id] = someObject;
						else
							delete node.trackers[someObject.id]
					}
					if( node.output === "3" ) {
						topic = "path";
						someObject = processPath( someObject, node );
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
