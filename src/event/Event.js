/**
 * @author John Robinson
 */
var pkg = rad.getPackage("event");

pkg.Event = rad.core.RadClass.extend({
	
	_className:"Event",
	name:"Event",
	
	_type:"event",
	
	_stopped:false,
	
	init:function(type) {
		if(typeof type == "string") {
			this._type = type;
			this._ns = this.name+"."+this._type;
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