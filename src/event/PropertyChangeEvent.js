var pkg = rad.getPackage("event");
pkg.PropertyChangeEvent = pkg.Event.extend({
	
	_className:"PropertyChangeEvent",
	name:"PropertyChange",
	
	newValue:undefined,
	oldValue:undefined,
	
	//type is the name of the property that changed
	
	init:function(type, newValue, oldValue) {
		this._super(type);
		this.newValue = newValue;
		this.oldValue = oldValue;
	}
});