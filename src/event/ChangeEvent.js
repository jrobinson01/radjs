var pkg = rad.getPackage("event");
pkg.ChangeEvent = pkg.Event.extend({
	
	_className:"ChangeEvent",
	name:"Change",
	data:null,//the object that changed
	
	init:function(data) {
		this._super();
		this.data = data;
	}
});