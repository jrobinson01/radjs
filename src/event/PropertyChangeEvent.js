var pkg = rad.getPackage("event");
pkg.PropertyChangeEvent = pkg.Event.extend({
	
	_className:"PropertyChangeEvent",
	name:"PropertyChange",
	
	newValue:undefined,
	oldValue:undefined,
	
	init:function(type, newValue, oldValue) {
		this._super(type);
		this.newValue = newValue;
		this.oldValue = oldValue;
	}
});