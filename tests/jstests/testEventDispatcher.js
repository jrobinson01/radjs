/**
 * @author John Robinson
 */
(function() {
	//create a generic subclass of Test to test the EventDispatcher
	var EDTest = rad.util.test.Test.extend({
		_className:"EDTest",
		_name:"EDTest",
		_debug:true,
		
		_ed:null,//EventDispatcher
		
		setup:function(asserts) {
			this._super(asserts);
			this._ed = new rad.event.EventDispatcher();
		},
		
		_run:function() {
			this._ed.destroy();
			this._super();
		}
	});
	
	
	var EdDispatchTest = EDTest.extend({
		
		_className:"EdDispatchTest",
		name:"EdDispatchTest",
		
		_run:function() {
			this._ed.addListener("Event.event", this.onEvent, this);
			this._ed._dispatch(new rad.event.Event("event"));
			this._ed.removeListener("Event.event", this.onEvent, this);
			this._super();
		},
		
		onEvent:function(event) {
			this.log("onEvent")
			this._result.eventFired = true;
		}
		
	});
	
	var EDMultiAddRemove = EDTest.extend({
		
		_className:"EDMultiAddRemove",
		name:"EDMultiAddRemove",
		
		_run:function() {
			this._ed.addListener("Event.event Event.test", this.onEvent, this);
			this._ed._dispatch(new rad.event.Event("event"));
			this._ed._dispatch(new rad.event.Event("test"));
			this._ed.removeListener("Event.event Event.test", this.onEvent, this);
			this._super();
		},
		
		onEvent:function(event) {
			this.log("onEvent:", event);
			if(event.type =="test") {
				this._result.testFired = true;
			}
			if(event.type=="event") {
				this._result.eventFired = true;
			}
		}
	});
	
	//tests adding a listener for multiple events
	// and then removing all references to this object.
	var RemoveAll = EDTest.extend({
		_className:"RempoveAll",
		_name:"RemoveAll",
		
		_run:function() {
			var h = function(){};
			this._ed.addListener("Event.event Event.test", h, this);
			this._ed.addListener("Event.bar Event.foo", h, this);
			this._ed.removeListener(null,null, this);
			this._result.els = this._ed._eventListeners;
			this.log("result:", this._result);
		}
		
	});

	//run all the tests!
	
	//simple add, dispatch and then remove.
	//todo: break this one up into three tests...
	var addDispatchRemove = new EdDispatchTest();
	addDispatchRemove.setup({eventFired:true});
	addDispatchRemove.run();//call public run
	
	//test adding one listener for multiple events.
	var multiTest = new EDMultiAddRemove();
	multiTest.setup({eventFired:true, testFired:true});
	multiTest.run();
	
	//test removeall
	var ra = new RemoveAll();
	ra.setup({
		els:{
		"Event.bar":[],
		"Event.foo":[],
		"Event.event":[],
		"Event.test":[]
		}
	});
	ra.run();
})();
