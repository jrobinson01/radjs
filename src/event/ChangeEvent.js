var pkg = rad.getPackage("event");
pkg.ChangeEvent = pkg.Event.extend({
	
	_className:"ChangeEvent",
	name:"Change",
	model:null,
	
	init:function(model) {
		this._super();
		this.model = model;
	}
});