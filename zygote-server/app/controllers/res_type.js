// This file handles all the resource types
// eg '/bbb/gpio/' and maybe '/bbb/wifi/temp/'
// note all urls end with a '/'
// POSTing to res_type will create a new res of that type
// eg POST /bbb/gpio/ {'ep':1} will create '/bbb/gpio/1' res
// GET will return all active ep's and resp pins


var data = require('./data.js');

var used_pins = data.used_pins;
		
//req.params[0] => gives path following "bbb/"
//EG : if input url is '/bbb/gpio/'; we have 'gpio'
		
//Returns the all (active) ep for the given resource type
exports.get = function (req, res) {
	var id = req.params[0]; //id is res_type's URL

	//see the container; check if it is active
	var container = req.url.split('/')[1];
	if(! (container in data.res_type)){
		res.status(404).json({"error":"container not active"});
		return;
	}

	var eps = data.res_type[container][id];
	if(eps){
		res.json(eps);
	}
	else{
		res.status(404).json({"error" : "resource type not found"});
	}
};

exports.post = function(req, res) {
	var id = req.params[0]; //id is res_type's URL
	var ep = req.body['ep'];
	if(! ep){
		res.status(404).json({"error" : "unsupported operation"});
		return;
	}

	//see the container; check if it is active
	var container = req.url.split('/')[1];
	if(! (container in data.res_type)){
		res.status(404).json({"error":"container not active"});
		return;
	}

	var ep_set = data.res_type[container][id];

	if(ep_set && (ep in ep_set)){
		//end point is available
		if(register_pins(used_pins[container], ep_set[ep]).length != 0){
			res.status(404).json({"error" : "pins busy"});
			return;
		}
		
		//add new urls to instance controller 'ic'
		var ic = require('./res_instance.js');
		req.app.route(req.url+ep).get(ic.read)
						.post(ic.write)
						.put(ic.config);

		//add ep url to res_inst
		data.res_inst[container][id+'/'+ep] = ep_set[ep];
		
		res.json({"url":req.url+ep})
	}
	else{
		res.status(404).json({"error" : "invalid endpoint"});
	}
};

exports.del = function(req, res){
	var id = req.params[0]; //id is res_type's URL
	var ep = req.body['ep'];
	if(! ep){
		res.status(404).json({"error" : "unsupported operation"});
		return;
	}

	//see the container; check if it is active
	var container = req.url.split('/')[1];
	if(! (container in data.res_type)){
		res.status(404).json({"error":"container not active"});
		return;
	}

	//see if this ep had been activated
	if(! ((id+'/'+ep) in data.res_inst[container]) ){
		res.status(404).json({"error":"res_inst not active"});
		return;
	}

	//if so, free pins and delete it
	var pins = data.res_inst[container][id+'/'+ep]['pins'];
	for( var i in pins){
		//free ze pins - get index of the pin, remove it
		//NO error checking as pin is supposed to be there
		used_pins[container].splice(used_pins[container].indexOf(pins[i]), 1);
	}
	delete data.res_inst[container][id+'/'+ep];
	res.json({"url" : req.url+ep});
};

//takes in list of busy pins and json of res_type
//returns the list of pins not allocated
function register_pins(busy, type){
	if ('pins' in type){
		reqd = type['pins'];
		res = [];
		for(pin in reqd){
			if(busy.indexOf(reqd[pin]) > -1) res.push(reqd[pin]);
		}
		if(res.length == 0){
			for(i in reqd) busy.push(reqd[i]);
		}
		console.log(used_pins);
		return res;
	}
	return [];
}