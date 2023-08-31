//Copyright (c) 2023 Fred Juhlin
// Provide digest authentication 

const digestAuth = require("@mreal/digest-auth");
const got = require("got");

var exports = module.exports = {};

exports.get = function( device, path, resonseType, callback ) {
	if( !device || !device.hasOwnProperty("address") || !device.hasOwnProperty("user") || !device.hasOwnProperty("password") ) {
			callback(true,{
				statusCode: 0,
				statusMessage: "Invalid device",
				body: "Missing address,user or password"
			});
			return;
	}
	var protocol = device.protocol || "http";
	var url = protocol + "://" + device.address + path;
	console.log(url);
	var client = got.extend({
		hooks:{
			afterResponse: [
				(res, retry) => {
					const options = res.request.options;
					const digestHeader = res.headers["www-authenticate"];
					if (!digestHeader){
						return res;
					}
					const incomingDigest = digestAuth.ClientDigestAuth.analyze(	digestHeader );
					const digest = digestAuth.ClientDigestAuth.generateProtectionAuth( incomingDigest, device.user, device.password,{
						method: options.method,
						uri: options.url.pathname,
						counter: 1
					});
					options.headers.authorization = digest.raw;
					return retry(options);
				}
			]
		}
	});

	(async () => {
		try {
			const response = await client.get( url,{
				responseType: resonseType,
				https:{rejectUnauthorized: false}
			});
			callback(false, response.body );
		} 
		catch (error) {
			if( error.code === 'ECONNREFUSED' ) {
				callback( true, {
					statusCode: error.code,
					statusMessage: "Connection refused",
					body: "Port is not active or blocked by firewall"
				});
				return;
			}
			if( error.code === 'EHOSTUNREACH' ) {
				callback( true, {
					statusCode: error.code,
					statusMessage: "Unreachable",
					body: "Host does not respond"
				});
				return;
			}
			if( error.code === 'ETIMEDOUT' ) {
				callback( true, {
					statusCode: error.code,
					statusMessage: "Timeout",
					body: "Host does not respond"
				});
				return;
			}
			callback( true, {
				statusCode: error && error.response ? error.response.statusCode:0,
				statusMessage: error && error.response ? error.response.statusMessage:"Unkown error",
				body: error && error.response ? error.response.body:""
			});
		}
	})();
}

exports.post = function( device, path, body, responseType, callback ) {
	if( !device || !device.hasOwnProperty("address") || !device.hasOwnProperty("user") || !device.hasOwnProperty("password") ) {
		callback(true,{
			statusCode: 0,
			statusMessage: "Invalid input",
			body: "Missing address,user or password"
		});
		return;
	}

	var json = null;
	if( typeof body === "object" )
		json = body;
	if( typeof body === "string" && (body[0]==='{' || body[0]==='[' ))
		json = JSON.parse(body);

	var protocol = device.protocol || "http";
	var url = protocol + "://" + device.address + path;
	
	var client = got.extend({
		hooks:{
			afterResponse: [
				(res, retry) => {
					const options = res.request.options;
					const digestHeader = res.headers["www-authenticate"];
					if (!digestHeader){
						return res;
					}
					const incomingDigest = digestAuth.ClientDigestAuth.analyze(	digestHeader );
					const digest = digestAuth.ClientDigestAuth.generateProtectionAuth( incomingDigest, device.user, device.password,{
						method: options.method,
						uri: options.url.pathname,
						counter: 1
					});
					options.headers.authorization = digest.raw;
					return retry(options);
				}
			]
		}
	});

	(async () => {
		try {
			var response = 0;
			if( json ) {
				response = await client.post( url, {
					json: json,
					responseType: "json",
					https: {rejectUnauthorized: false}
				});
			} else {
				response = await client.post( url, {
					body: body,
					responseType: responseType,
					https: {rejectUnauthorized: false}
				});
			}
			callback(false, response.body );
		} catch (error) {
			if( error.code === 'ECONNREFUSED' ) {
				callback( true, {
					statusCode: error.code,
					statusMessage: "Connection refused",
					body: "Port is not active or blocked by firewall"
				});
				return;
			}
			if( error.code === 'EHOSTUNREACH' ) {
				callback( true, {
					statusCode: error.code,
					statusMessage: "Unreachable",
					body: "Host does not respond"
				});
				return;
			}
			if( error.code === 'ETIMEDOUT' ) {
				callback( true, {
					statusCode: error.code,
					statusMessage: "Timeout",
					body: "Host does not respond"
				});
				return;
			}
			callback( true, {
				statusCode: error && error.response ? error.response.statusCode:0,
				statusMessage: error && error.response ? error.response.statusMessage:"Unkown error",
				body: error && error.response ? error.response.body:""
			} );
		}
	})();
}
