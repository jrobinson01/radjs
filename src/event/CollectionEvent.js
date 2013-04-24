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
		console.log("creating collection event:", type, i, m);
		this.index = i;
		this.item = m;
		
	}
});


