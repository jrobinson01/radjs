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
