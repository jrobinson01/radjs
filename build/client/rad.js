/**
 * @author John Robinson
 * @description Closure to enclose the Rad library
 */
(function(window, undefined) {

	//create the rad and rad core namespace
	var rad = {};
	window.rad = rad;
	rad.core = {};
	rad.core.debug = true;//flag for debugging
	//utility to create namespaced packages
	rad.getPackage = function(ns) {
		var sp = String(ns).split(".");//example: 'event.arrayCollection'
		var current = rad;
		for(var i=0; i<sp.length; i++) {
			if(current[sp[i]] === undefined) {
				current[sp[i]] = {};
			}
			current = current[sp[i]];
		}
		return current;
	};
	
	//avoid conflicts
	rad.noConflicts = function(scope) {
		scope.rad = window.rad;
		delete window.rad;
	};
	
	//include all class files (ANT)
	//closure end is in close.js	
/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
  // The base Class implementation (does nothing)
  this.Class = function(){};
  
  // Create a new Class that inherits from this class
  Class.extend = function(prop) {
    var _super = this.prototype;
    
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;
    
    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" && 
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
            
            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];
            
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);        
            this._super = tmp;
            
            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }
    
    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }
    
    // Populate our constructed prototype object
    Class.prototype = prototype;
    
    // Enforce the constructor to be what we expect
    Class.constructor = Class;

    // And make this class extendable
    Class.extend = arguments.callee;
    
    return Class;
  };
})();
/**
 * @author John Robinson
 * @description Base Class for all classes in the Rad Library
 */
 
var pkg = rad.getPackage("core");

pkg.RadClass = Class.extend({
	 
	_className:"RadClass",//reflects the name of our class
	name:"RadClass",//instance name (optional, used in logging)
	
	_uniqueId:null,
	_debug:false,//whether or not we want to log to the console
	
	init:function() {
		//should NOT call _super in our first class's init.
		this._uniqueId = Math.round(Math.random()*10000)+new Date().getTime();
	},
	
	log:function(){
		if(rad.core.debug && this._debug) {
			if(console !== undefined && console.log) {
				arguments[0] = this.name+":"+arguments[0];
				return console.log.apply(console, arguments);
			}
		}
	},
	
	error:function() {
		if(rad.core.debug && this._debug) {
			if(console !== undefined && console.error !== undefined) {
				arguments[0] = this.name+":"+arguments[0];
				return console.error.apply(console, arguments);
			}
		}
	},
	
	destroy:function() {
		//hmm..
		//this *should* just delete our references to a property we've assigned
		// if the reference has other things referencing it.
		// if the property doesn't have any more references, it should
		// be deleted.
		for(var i in this) {
			delete this[i];
		}
	}
});
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
});/**
 * @author John Robinson
 */
var pkg = rad.getPackage("event");
pkg.EventDispatcher = rad.core.RadClass.extend({
	
	_className:"EventDispatcher",
	_eventListeners:{},
	_debug:true,
	
	init:function() {
		this._super();
		this._eventListeners={};
	},
	
	//eventName can be a single string (ex: Collection.add, Change, etc)
	//or a list of events (ex: "Collection.add Collection.remove")
	addListener:function(eventName, handler, scope) {
		var names = this._parseEventName(eventName);
		var n;
		for(var i=0; i<names.length; i++) {
			n = names[i];
			//loop and add listeners for each name
			if(this._eventListeners[n] == undefined) {
				this._eventListeners[n] = [];
			}
			//deal with missing scope/handler here (especially handler)!?
			this._eventListeners[n].push({scope:scope, handler:handler});
			}
		return this;
	},
	
	
	removeListener:function(eventName, handler, scope){
		
		if(eventName === null || eventName === undefined) {
			if(handler === null || handler === undefined) {
				if(scope !== null && scope !== undefined) {
					//if both eventName and handler are null but scope is not, remove ALL listeners
					// for the scope object.
					this.log("scope is not null, removing all listeners for scope:", scope, this._eventListeners);
					for(var i in this._eventListeners) {
						for(var a=this._eventListeners[i].length-1; a>=0; a--) {
							
							this.log("removing:", i, a, this._eventListeners[i][a].scope);
							this.removeListener(i, this._eventListeners[i][a].handler, this._eventListeners[i][a].scope);
						}
					}
					return this;
				} else {
					return this;//not much to do here
				}
			}
		}
		var names = this._parseEventName(eventName);
		var n;
		for(var i=0; i<names.length; i++) {
			n = eventName[i];
		if(n !== null && n !== undefined) {
			var el = this._eventListeners[n];
			if( el !== undefined) { 
				for(var i=0; i<el.length; i++) {
					if(el[i].scope == scope && el[i].handler == handler) {
						el.splice(i,1);
						break;
					}
				}
			}
		}
		}
		return this;
	},
	
	_dispatch:function(event) {
		if(event instanceof rad.event.Event) {
			var eName = event._ns;
			if(this._eventListeners[eName] !== undefined) {
				var el = this._eventListeners[eName];
				for(var i=0; i<el.length; i++) {
					
					if(!event.isPropagationStopped()) {
						var item = el[i];
						var scope = (item.scope === undefined || item.scope === null) ? undefined : item.scope;
						
						//this allows for multiple arguments to be passed, not sure if that's good or bad, but I think, BAD.
						//JSPerf the difference?
						//el[i].handler.apply(el[i].scope, arguments);
						//or
						if(scope != undefined) {
							item.handler.apply(scope, arguments);
						} else{
							//scope is nada, try handler directly.
							item.handler(event);
						}
						
					} else {
						break;
					}
				}
			}
			//event.destroy();//egad. this results in the event not being populated.
			//TODO: investigate what cases would causes events to not get GC'd!
			return this;
		} else {
			throw new Error("invalid event passed to _dispatch");
		}
	},
	
	_parseEventName:function(eventName) {
		var names = [];
		if(typeof eventName == "string") {
			names = eventName.split(" ");
		}
		return names;
	}
	
});var pkg = rad.getPackage("event");
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


var pkg = rad.getPackage("event");
pkg.ChangeEvent = pkg.Event.extend({
	
	_className:"ChangeEvent",
	name:"Change",
	data:null,//the object that changed
	
	init:function(data) {
		this._super();
		this.data = data;
	}
});var pkg = rad.getPackage("event");
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
});var pkg = rad.getPackage("model");

pkg.Model = rad.event.EventDispatcher.extend({
	
	_className:"Model",
	name:"Model",
	
	_data:null,
	
	init:function(name, defaults) {
		this._data = defaults || {};
		this.name = name;
		//this._data = {};
		this._super();
	},
	
	set:function(key, value){
		var tv = this._data[key];
		if(tv != value) {
			this._data[key] = value;
			//dispatch a unique event for this property
			this._dispatch(new rad.event.PropertyChangeEvent(key, value, tv));
			//dispatch a more generic event that doesn't take the property into account.
			this._dispatch(new rad.event.ChangeEvent(this));
		}
	},
	
	get:function(key) {
		return this._data[key];
	},
	
	reset:function() {
		this._data = {};//ugh?
	}
});

var pkg = rad.getPackage("model");

pkg.CachableModel = pkg.Model.extend({
	
	_className:"CachableModel",
	name:"CachableModel",
	_expiration:null,//time in milliseconds before this model should expire.
	_modified:new Date().getTime(),
	
	_defaults:{},
	
	init:function(name, expiration) {
		this._super(name);
		this._cacheKey = this.name+"-"+this._className;
		this._restore();
	},
	
	set:function(key, value) {
		this._super(key, value);
		localStorage.setItem(this._cacheKey+"-"+key, JSON.stringify(value));
		this._modified = new Date().getTime();
		//TODO: store modified time in cache as well?
	},
	
	get:function(key) {
		var tv = this._super(key);
		if(tv == undefined) {
			//this doesn't solve another window changing the property...
			tv = JSON.parse(localStorage.getItem(this._cacheKey+"-"+key));
			this[key] = tv;
		}
		return tv;
	},
	
	_restore:function(defaults) {
		//we need to loop through a list of known properties
		//and fetch them from localStorage
		//...or lazy load stuff from cache as 'get' is called?
		for(var i in this._defaults) {
			//
			this.set(i, this.get(i));
		}
	},
	
	reset:function() {
		this._super();
		this._restore();
	}
});
var pkg = rad.getPackage("collection");

pkg.Collection = rad.event.EventDispatcher.extend({
	
	_className:"Collection",
	name:"Collection",
	_debug:true,
	
	data:[],//raw data array
	sorts:[],//our sort functions
	_sortInterval:null,//timeout to minimize sort actions
	
	//key for our objects. When using indexOf() and contains(), 
	// if our key is not null, we should look at our item's key value instead of the entire object.
	// we use the _table property to store the index of the item in our data associated with the given key.
	//example: our data is an array of VO's, key is 'Id'
	//this._table[id] = this.indexOf(VO with the given Id);
	// when we call contains() or indexOf(), if a key exists, test the table.
	// otherwise test data.indexOf().
	_key:null,
	_table:{},//key/index lookup
	
	init:function(d, key) {
		this._super();
		if(typeof key == "string") {
			this._key = key;
		}

		this.sorts = [];
		this.autoSort = false;
		this._table = {};
		
		//need to check to make sure d is an array!
		if(d !== null && d !== undefined && d.push !== undefined) {
				this.data = d.slice(0);//create a copy!
				if(this._key !== null) {
					//this.log("REBUILDING TABLE!", this, this._key);
					this._rebuildTable();
					//this.log("done rebuiding table:", this._table, this.data.slice(0));
				}
		} else {
			this.data = [];
		}
		
	},
	
	
	//if unique, addItem will only add the item once
	// TODO: adjust to use addItemAt
	addItem:function(item, unique) {
		//this.log("adding item:", item, unique);
		if (unique == true) {
			if(this._key !== null) {
				//this.log("addItem unique:", item);
				if(this._table[item[this._key]] !== undefined) {
					this.log("keyed item already exists!!", item, " returning index:",  this._table[item[this._key]]);
					return this._table[item[this._key]];
				}
			} else {
				for(var i=0; i<this.getLength(); i++) {
					if(this.getItemAt(i) == item) {
						return i;
					}
				}
			}
		}
		//this.log("item is unique. adding:", item);
		//if we get here, the item is unique and can be added.
		this.data.push(item);
		//if we have a key, store this item's index in our table.
		if(this._key !== null) {
			this.log("adding item:", this._key, item[this._key]);
			this._table[item[this._key]] = this.data.length - 1;
		}
		//this.log("item added. dispatching ADD change...");
		this._dispatchChange("add", item, this.data.length - 1);
		
		// listen for a change event on the model itself
		if ( item instanceof rad.model.Model) {
			item.removeListener("Change", this._onItemChanged, this);
			item.addListener("Change", this._onItemChanged, this);
		}
		
		return this.data.length - 1;
	},
	
	removeItem:function(item) {
		//this.log(this,"removeItem called with item:", item,"the key:", this._key, "index stored in key:",this._table[item[this._key]]);
		var id = this.indexOf(item);
		if(id != -1) {
			this.log(this, "found an item to remove at index:", id);
			
			if ( item instanceof rad.model.Model ) {
				item.removeListener("Change", this._onItemChanged, this);
			}
			
			this.removeItemAt(id);
		} else {
			this.log("no item to remove:", item);
		}
	},
	
	removeItemAt:function(index) {
		//this.log(this, "ac removeItemAt", index);
		var item = this.data[index];
		if(item !== undefined) {
			if(this._key !== null){
				//this.log("checking for item in _table:", this._table[item[this._key]]);
				this._table[item[this._key]] = undefined;
				//delete this._table[item[this._key]];
				//JR: We also need to rebuild our _table!!
				//this._rebuildTable();
			}
			if ( item instanceof rad.model.Model ) {
				item.removeListener("Change", this._onItemChanged, this);
			}
			this.data.splice(index,1);//
			if(this._key !== null) {
				this._rebuildTable();
			}
			this._dispatchChange("remove", item, index);
		}
	},
	
	getItem:function(item) {
		return this.getItemAt(this.indexOf(item));
	},
	
	getItemAt:function(index) {
		return this.data[index];
	},
	
	removeAll:function() {
		for(var i=0; i<this.data.length; i++) {
			var item = this.data[i];
			if ( item instanceof rad.model.Model ) {
				item.removeListener("Change", this._onItemChanged, this);
			}
		}
		this.data = [];
		this._table = {};
		//dispose of Key as well?
		this._dispatchChange("reset");
	},
	
	setItemAt:function(item, index) {
		this.log("setItemAt called:", item, index);
		this.data[index] = item;
		
		if(this._key !== null) {
			this._table[item[this._key]] = index;
		}
		
		this._dispatchChange(this.UPDATE, item, index);
	},
	
	toArray:function() {
		return this.data;
	},
	
	setCollection:function(a, key) {
		this.log("setCollection called!", a, key);
		//TODO: deal with setting up the _key and _table
		if(key !== undefined) {
			this._key = key;
			this._table = {};
		}
		
		// loop over and unbind the change events if they are Models
		for ( var i = 0; i < this.data.length ; i++ ) {
			var item = this.data[i];
			
			if ( item instanceof rad.model.Model) {
				item.removeListener("Change", this._onItemChanged, this);
			}
			
		}
		
		//set our data to the array passed in
		this.data = a;
		
		// loop over and bind the change events if they are Models
		for ( var j = 0; j < this.data.length ; j++ ) {
			var item = this.data[j];
			
			if ( item instanceof rad.model.Model) {
				item.addListener("Change", this._onItemChanged, this);
			}
			
		}
		
		if(this._key !== undefined) {
			this._rebuildTable();
		}
		//dispatch a reset event..
		this._dispatchChange(this.RESET);
	},
	
	contains:function(item) {
		this.log("checking for item:", item);
		if(this._key !== null && item !== null && item !== undefined) {
			this.log("using _table and key:", item[this._key]);
			return this._table[item[this._key]] !== undefined ? this._table[item[this._key]] > -1 : false;
		}
		return (this.data.indexOf(item) > -1);
	},
	
	indexOf:function(item) {
		if(this._key !== null && item !== null && item !== undefined) {
			var r = this._table[item[this._key]] !== undefined ? this._table[item[this._key]] : -1;
			this.log("indexOf using table and key:", r, item[this._key]);
			return r;
		}
		return this.data.indexOf(item);
	},
	
	getLength:function() {
		return this.data.length;
	},
	
	//apply any sort or filter applied
	refresh:function() {
		
	},
	
	clone:function() {
		//TODO: Deep copy the array and add a clone() method to the base VO class, or UPClass?
		return new rad.collection.Collection(this.data.slice(0), this._key);
	},
	
	//iterate over each item and call the function (in scope if provided)
	each:function(fn, scope) {
		for(var i=0; i<this.getLength(); i++) {
			if(scope !== undefined && scope !== null) {
			fn.apply(scope, this.getItemAt(i));
			} else {
				fn(this.getItemAt(i));
			}
		}
	},
	
	addSortFunction:function(f, priority) {
		//priority is optional. lower numbers are higher priority
		// if undefined, sort function gets added to the end of the list.
		if (priority !== undefined) {
			this.sorts.splice(priority, 0, f);
		} else {
			this.sorts.push(f);
			priority = this.sorts.length-1;
		}
		//this.doSort();//not sure we want to sort immediately...
		return priority;
	},
	
	doSort:function() {
		clearTimeout(this._sortInterval);
		var t = this;
		//JR: determine how long to delay based on length
		var interval = this.getLength();
		if(this.getLength() > 1000) {
			interval = 1000;
		}
		this._sortInterval = setTimeout(function() {t._doSort();}, interval);
	},
	
	_doSort:function() {
		this.log("actually sorting!");
		clearInterval(this._sortInterval);
		var d = this.data.slice(0);
		if(this.sorts.length>0) {
			for(var i=0; i<this.sorts.length; i++) {
				this.data.sort(this.sorts[i]);
			}
		} else {
			//no sort functions provided. sort using builtin array method.
			//this.data.sort();//not sure this is necessary? return here instead
			this.log("no sort function provided. returning.");
			return;//nothing to sort
		}
		if(d !== this.data) {
			//dispatch an update?
			if(this._key !== null ) {
				this._rebuildTable();
			}
			this._dispatchChange(this.SORTED, null, null);
			//this.dispatchEvent(this.SORTED, {}, false);
		} else {
		}
	},
	
	removeSortFunction:function(sortID) {
		this.sorts.splice(sortID, 1);
	},
	
	/** Private **/
	_rebuildTable:function() {
		
		//dump our old table.
		this._table = {};
		var a=0;
		var len = this.data.length;
		var start = new Date().getTime();
		for(a=0; a<len; a++) {
			//this.log("setting ", this.data[a][this._key], "on table from: ", this.data[a], "to:", a);
			this._table[this.data[a][this._key]] = a;
		}
		var eTime = new Date().getTime() - start;
		this.log("it took:", eTime, "ms to rebuild the table:", len);
	},
	
	_onItemChanged: function (event) {
		this.log("_onItemChanged", event);
		this._dispatchChange("update", event.data, this.indexOf(event.data));
	},
	
	//this pretty much goes away.. in favor of dispatching events
	// based on name??
	_dispatchChange:function(kind, item, index) {
		this.log("dispatching a change!", kind, item, index);
		var cEvent = new rad.event.CollectionEvent(kind, index, item );
		this.log("event is ready:", cEvent);
		this._dispatch(cEvent);
		//why do this AFTER dispatching the change?
		if(this.autoSort==true && kind != "update" && kind != "sorted") {
			this.doSort();
		}
	},
	
	destroy:function() {
		this.removeAll();
		this._super();
	}
	
});
/**
 * @name FilteredCollection
 */

var pkg = rad.getPackage("collection");
pkg.FilteredCollection = pkg.Collection.extend(/** @lends FilteredCollection.prototype **/{
	
	_className:"FilteredCollection",
	name:"FilteredCollection",
	
	_debug:false,
	
	expression:true,//the expression to use in our default filter Function
	filterFunction:function(item) {return this.expression;},//default filter function
	dp:null,//dataprovider (Collection instance)
	_model:{},//
	
	init:function(dp, filterMap, model) {
		
		if(dp instanceof rad.collection.Collection) {
			this._super([], dp._key);
			this.dp = dp;
			this._key = this.dp._key;//
			//listen for ChangeEvent
			//TODO: rework this to a) listen for add,remove,etc
			// and separate out into distinct handlers for each
			//this.dp.addListener("Change", this._onTargetChange, this);
			this.dp.addListener("Collection.add", this._onTargetAdd, this);
			this.dp.addListener("Collection.remove", this._onTargetRemove, this);
			this.dp.addListener("Collection.update", this._onTargetUpdate, this);
			this.dp.addListener("Collection.reset", this._onTargetReset, this);
			
		} else {
			this.error("dataProvider supplied is not an ArrayCollection : ", arguments);
			return;
		}
		
		this._model = (model) || {};
		this.setFilter(filterMap);
	},
	
	//TODO: take into account generic objects OR models...
	//OR drop support for generic objects and only support Models?
	setFilter:function(filterMap) {
		//this.log("setFilter called:", filterMap);
		var shouldFilter = false;
		var isModel = (this._model.constructor == rad.model.Model);
		this.log("isModel?", isModel);
		if(typeof filterMap == "function") {
			//if a function is passed, use that for the filterfunction
			this.filterFunction = filterMap;
			shouldFilter = true;
			
		} else if(typeof filterMap == "string") {
			
			//if a string is passed, assume we want to compare it to each item directly.
			this.filterFunction = function(item) {
				if((String(item).indexOf(filterMap) > -1) || filterMap =="*"){
					return true;
				} return false;
			};
			shouldFilter = true;
			
		} else if (typeof filterMap == "object") {
			
			//filterMap is an object. loop through the properties
			//of the object and create conditionals..?how do deal with ||?
			//this.log("dealing with an object...")
			this._expression = "";
			shouldFilter = true;
			
			
			for (var i in filterMap) {
				
				if (filterMap[i] instanceof RegExp) {
					//this._expression+=" item."+i+""
					//this.log("regexp not supported yet in filterMap");
					if(isModel) {
						this._expression += " item."+i+".match("+filterMap[i]+") &&";
					} else {
						this._expression += " item."+i+".match("+filterMap[i]+") &&";
					}
				} else if (typeof filterMap[i] == "string") {
					//string, see if it exists
					if(isModel) {
						this._expression += "(item.get('"+i+"') !== undefined ) && (item.get('"+i+"') !== null) && ( item.get('"+i+"').indexOf( '"+filterMap[i]+"' ) > -1 ) &&";
					} else {
						this._expression += "(item."+i+" !== undefined ) && (item."+i+" !== null) && ( item."+i+".indexOf( '"+filterMap[i]+"' ) > -1 ) &&";
					}
				} else if ( typeof filterMap[i] == "number" || typeof filterMap[i] == "boolean") {
					//numbers.direct comparison
					if(isModel) {
						this._expression += " ( item.get('"+i+"') == "+filterMap[i]+" ) &&";
					} else {
						this._expression += " ( item."+i+" == "+filterMap[i]+" ) &&";
					}
				} else if ( typeof filterMap[i] == "object" ) {
				
					//hmm...
					//we need to use recursion to handle every nested object
					//aka.. createExpFromObject(object);
					//this.log("nested objects not supported in filterMap");
				}
			}
			//strip off the trailing &&.
			var sp = this._expression.substr(this._expression.lastIndexOf("&&")).trimRight();
			if(sp == "&&") {
				this._expression = this._expression.substr(0, this._expression.lastIndexOf("&&"));
			}
			//this.log("what's the expression?:", this._expression);
			
			this.filterFunction = function(item) {
				if(item !== undefined) {
				//this.log("testing item:", item, this._expression);
					if(eval(this._expression)){
						return true;
					}
				} else {
					this.error(this, "item is undefined??", item);//item is undefined?
					//console.trace();
				}
			
				return false;
			}
		}
		
		
		if(shouldFilter) {
			//JR: figure out why I used this.dp.data directly here
			// instead of using the collections methods? getLength(), getItemAt() etc?
			for(var i=0; i<this.dp.data.length;i++) {
				this._processItem(this.dp.data[i]);
			}

		}
	},
	
	_processItem:function(item) {
		this.log("processing an item:", item);
		if( this.filterFunction(item)) {
			this.log("item passes filter. adding:", item, this.expression, this.filterFunction);
			this.addItem(item, true);
		} else {
			this.log("item does NOT pass filter:", item);
			//no need to remove here, since we're processing our target data, and not our own data.
			this.removeItem(item);
		}
	},
	
	//Override setItemAt
	setItemAt:function(item, index) {
		//this.log("setItemAt called:", item, index);
		this.data[index] = item;
		
		if(this._key !== null) {
			this._table[item[this._key]] = index;
		}
		//original dispatches an UPDATE event here.
	},
	
	_onTargetAdd:function(event){
		var newItem, existingIndex;
		newItem = event.item;
		existingIndex = this.indexOf(newItem);
		if(existingIndex == -1 && this.filterFunction(newItem)) {
			this.addItem(newItem);
		}
	},
	
	_onTargetRemove:function(event) {
		this.removeItem(event.item);
	},
	
	_onTargetUpdate:function(event) {
		var newItem, existingItem;
		newItem = event.item;
		existingItem = this.getItem(newItem);
		
		if(this.filterFunction(newItem)) {
			//item passes filter
			//if it already exists, update, otherwise add.
			if(existingItem !== undefined) {
				if(newItem != existingItem) {
					this.setItemAt(newItem, this.indexOf(existingItem));
				}
			} else {
				this.addItem(newItem, true);
			}
		} else if(existingItem !== undefined) {
			this.removeItem(existingItem);
		}
	},
	
	_onTargetReset:function(event) {
		var i, len, item;
		len = this.dp.getLength();
		item = event.item;
		//remove all items first
		this.removeAll();
		
		for(i=len-1; i>=0; i--) {
			item = this.dp.getItemAt(i);
			if(this.filterFunction(item)) {
				this.addItem(item, true);
			}
		}
	},
	
	//
	_onItemChanged: function (event) {
		//
		//this.log("ITEM CHANGED IN FILTERED AC:", event);
		//JR: filteredAC's need to know more about this type of update event... but what do we actually need to know?
		if(this.filterFunction(event.data)) {
			//this._dispatchChange(this.ADD, event.context.data, this.indexOf(event.context.data));
			this.addItem(event.data, true);
		} else {
			//this._dispatchChange(this.REMOVE, event.context.data, this.indexOf(event.context.data));
			this.removeItem(event.data);
		}
		//dispatch an update event?
		this._dispatchChange(this.UPDATE);
	},
	
	
	clearFilter:function() {
		//reset our expression.
		//TODO: test our data again to update?
		this._expression = true;
	},
	
	destroy:function() {
		this.dp.addListener("Collection.add", this._onTargetAdd, this);
		this.dp.addListener("Collection.remove", this._onTargetRemove, this);
		this.dp.addListener("Collection.update", this._onTargetUpdate, this);
		this.dp.addListener("Collection.reset", this._onTargetReset, this);
		this._super();
	}
});
})(window, undefined);//end the closure
