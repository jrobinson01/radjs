var pkg = rad.getPackage("event");

pkg.CollectionEvent = rad.event.Event.extend({
	
	_className:"CollectionEvent",
	name:"Collection",
	
	//static types
	ADD:"add",
	REMOVE:"remove",
	UPDATE:"update",
	SORTED:"sort",
	RESET:"reset",
	REPLACE:"replace",
	
	item:null,
	index:null,
	
	init:function(type, i, m) {
		this._super(type);
		this.index = (i !== undefined) ? i : -1;
		this.item = (m !== undefined) ? m : {};
		console.log("Dafuq?",this);
	}
});

