/**
 * @author John Robinson
 */
var pkg = rad.getPackage("event");

pkg.Event = rad.core.RadClass.extend({
	
	_className:"Event",
	name:"Event",
	
	type:undefined,
	_stopped:false,
	_ns:undefined,
	
	init:function(type) {
		if(typeof type == "string") {
			this.type = type;
			this._ns = this.name+"."+this.type;
		} else {
			//no type, default to just this.name
			this._ns = this.name;
		}
		this._super();
	},
	
	stopPropagation:function() {
		this._stopped = true;
	},
	
	isPropagationStopped:function() {
		return this._stopped;
	}
});