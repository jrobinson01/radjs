
var pkg = rad.getPackage("collection");
FilteredCollection = pkg.Collection.extend(/** @lends FilteredCollection.prototype **/{
	
	_className:"FilteredCollection",
	name:"FilteredCollection",
	
	_debug:false,
	
	expression:true,//the expression to use in our default filter Function
	filterFunction:function(item) {return this.expression;},//default filter function
	dp:null,
	
	init:function(dp, filterMap) {
		
		if(dp instanceof ArrayCollection) {
			this._super([], dp._key);
			this.dp = dp;
			this._key = this.dp._key;//
			this.dp.addListener(dp.DATA_CHANGED, this._onTargetChange, this);
		} else {
			this.error("dataProvider supplied is not an ArrayCollection : ", arguments);
			return;
		}
		
		this.setFilter(filterMap);
	},
	
	setFilter:function(filterMap) {
		//this.debug("setFilter called:", filterMap);
		var shouldFilter = false;
		
		//if(!this.processing) {
			//go ahead and set the filter!

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
				//this.debug("dealing with an object...")
				this._expression = "";
				shouldFilter = true;
				
				for (var i in filterMap) {
					
					if (filterMap[i] instanceof RegExp) {
						//this._expression+=" item."+i+""
						//this.debug("regexp not supported yet in filterMap");
						this._expression += " item."+i+".match("+filterMap[i]+") &&";
					} else if (typeof filterMap[i] == "string") {
						//string, see if it exists
						this._expression += "(item."+i+" !== undefined ) && (item."+i+" !== null) && ( item."+i+".indexOf( '"+filterMap[i]+"' ) > -1 ) &&";
					} else if ( typeof filterMap[i] == "number" || typeof filterMap[i] == "boolean") {
						//numbers.direct comparison
						this._expression += " ( item."+i+" == "+filterMap[i]+" ) &&";
					} else if ( typeof filterMap[i] == "object" ) {
					
						//hmm...
						//we need to use recursion to handle every nested object
						//aka.. createExpFromObject(object);
						//this.debug("nested objects not supported in filterMap");
					}
				}
				//JR: a bit of a hack, but the expression created above will end in &&..
				this._expression +=" true";
				//this.debug("what's the expression?:", this._expression);
				
				this.filterFunction = function(item) {
					if(item !== undefined) {
					//this.debug("testing item:", item, this._expression);
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
		//} else {
			//if we're in the middle of processing
			//we want to listen for processing to complete
			//before changing the filterfunction..?
		//}
		
		if(shouldFilter) {
			//JR:
			//this.debug("SHOULD FILTER!", this.dp.data.length);
			
			// use a Processor instead of looping!
			var _processItem = function(item) {
				this.debug("processing an item:", item);
				if( this.filterFunction(item)) {
					this.debug("item passes filter. adding:", item, this.expression, this.filterFunction);
					this.addItem(item, true);
				} else {
					this.debug("item does NOT pass filter:", item);
					//no need to remove here, since we're processing our target data, and not our own data.
					this.removeItem(item);
				}
			};
			for(var i=0; i<this.dp.data.length;i++) {
				_processItem.call(this, this.dp.data[i]);
			}

		}
	},
	
	//Override setItemAt
	setItemAt:function(item, index) {
		//this.debug("setItemAt called:", item, index);
		this.data[index] = item;
		
		if(this._key !== null) {
			this._table[item[this._key]] = index;
		}
		//original dispatches an UPDATE event here.
	},
	
	//handle our target data changing
	_onTargetChange:function(event) {
		
		//if add, remove or update....
		var newItem = event.context.item;
		var type = event.context.type;
		var existingIndex = this.indexOf(newItem);
		this.debug("got change:", event.context.type, "existing index:", existingIndex);
		if(type == this.ADD) {
			if(this.filterFunction(newItem) && existingIndex == -1) {
				this.addItem(newItem, true);
			}
		} else if(type == this.REMOVE) {
			this.removeItemAt(existingIndex);
		} else if(type == this.UPDATE) {
			//this.debug("handling an update:", newItem);
			if(this.filterFunction(newItem)) {
				//if we have this item we can update it, otherwise
				// we should add it.
				//this.debug("update. item passes filter:", newItem);
				if(existingIndex > -1){
					//this.debug("item exists: updating..", newItem === this.getItemAt(existingIndex));
					if(newItem != this.getItemAt(existingIndex)) {
						//this.debug("new item does NOT match existing item. calling setItemAt");
						this.setItemAt(newItem, existingIndex);
					}
					
				} else {
					//this.debug("item does not exist: ADDING!", newItem);
					this.addItem(newItem, true);
				}
			} else {
				//this.debug("item does NOT pass filter. removing", newItem);
				if(existingIndex>-1) {
					this.removeItemAt(existingIndex);
				} else{
					this.removeItem(newItem);
				} 
			}
		} else if(type == this.RESET) {
			//this.debug("HANDLING a reset.");
			this.removeAll();
			
			var len = this.dp.data.length;
			
			for(var i=len-1; i>0; i--) {
				var item = this.dp.data[i];
				if(this.filterFunction(item)) {
					this.addItem(item, true);
				} else {
					this.removeItem(item);
				}
			}
		}else {
			//this.debug(this,"handling unknown event type:", event.context);
		}
	},
	

	_onItemChanged: function (event) {
		//
		//this.debug("ITEM CHANGED IN FILTERED AC:", event);
		//JR: filteredAC's need to know more about this type of update event... but what do we actually need to know?
		if(this.filterFunction(event.context.data)) {
			//this._dispatchChange(this.ADD, event.context.data, this.indexOf(event.context.data));
			this.addItem(event.context.data, true);
		} else {
			//this._dispatchChange(this.REMOVE, event.context.data, this.indexOf(event.context.data));
			this.removeItem(event.context.data);
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
		this.dp.removeListener(this.DATA_CHANGED, this._onTargetChange, this);
		this._super();
	}
});