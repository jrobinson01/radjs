/**
 * @author John Robinson
 */

//create a subclass of Test to test the EventDispatcher
var EdDispatchTest = rad.util.test.Test.extend({
	
	_className:"EdDispatchTest",
	name:"EdDispatchTest",
	_debug:true,
	
	setup:function(asserts) {
		this._super(asserts);
		this._ed = new rad.event.EventDispatcher();
	},
	
	_run:function() {
		this._ed.addListener("Event.event", this.onEvent, this);
		this._ed._dispatch(new rad.event.Event("event"));
		this._ed.removeListener("Event.event", this.onEvent, this);
		this._ed.destroy();
	},
	
	onEvent:function(event) {
		this.log("onEvent")
		this._result.eventFired = true;
	}
	
});

//run it!
var myTest = new EdDispatchTest();
myTest.setup({eventFired:true});
myTest.run();//call public run