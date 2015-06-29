/***element_array_from_declaration is used to turn string of java variable declarations into an array of objects
//e.g. takes "public final String one; private static TextView two;" and returns [{type : 'TextView', identifier : 'one'}, {type : 'String', identifier : 'one'},  {type : 'String', identifier : 'two'},  {type : 'String', identifier : 'three'}]

//***the options object is used for formatting and code generation options
//an empty object {} will work if you have no options
//the full options example:
	{
	addButtonOnClickListener : true, //generates OnClickListener for button objects - values are true or false
	declareInline : true //declares java inline e.g. returns final String one = etResources().getString(R.string.one);
	}
*/
var java_declaration_parser = (function(){
	//main driver function
	return {
		element_array_from_declaration: function (input, options){
		return get_element_array(input, options);
		}
	};

	//generates inflated code string based on variable type
	function get_element_array(java_text, options){
		var var_array = java_string_to_array_sans_comments(java_text);
		var hash_array = var_array_to_hash_array(var_array);
		return hash_array;
	}

	//takes string of java text and returns array of cleaned up variables with comments removed
	//e.g. "public final String one; private static TextView two;" and returns ['String one', 'TextView two']
	function java_string_to_array_sans_comments(java_text){
		//1.strips multi-line comments (see http://ostermiller.org/findcomment.html) 2.strips beginning space, single-line comments and reserved words as they are unneeded and make parsing later easier 3. removes extra white-space between variables; 4. removes extra white-space within variables; 5. splits variables on semi-colon 6.filters out empty strings in array; 
		var split_text = java_text.replace(/\/\*([^*]|[\r\n]|(\*+([^*\/]|[\r\n])))*\*+\//g, ' ').replace(/\/\/(.)*\n|\/\/(.)*$|\bstatic\b|\bfinal\b|\bpublic\b|\bprivate\b|\bprotected\b|^\s+/g, "").replace(/[\s]*;[^A-Z\/]*/gi, ';').replace(/\s+/g, ' ').split(';').filter(Boolean);
		return split_text;
	} 
	//takes array of split java variable e.g. ['TextView one', 'String one, two, three'] and returns [{type : 'TextView', identifier : 'one'}, {type : 'String', identifier : 'one'},  {type : 'String', identifier : 'two'},  {type : 'String', identifier : 'three'}]
	function var_array_to_hash_array(var_array){
		var hash_array = var_array.map(function(var_string){
			return var_string_to_hash(var_string);
		});
		//String one, two, three is returned as [{type : 'String', identifier : 'one'}, {type : 'String', identifier : 'two'},  {type : 'String', identifier : 'three'}] within list so this flattens the list
		var merged = [];
		return merged.concat.apply(merged, hash_array);
	}

	//creates object by parsing string for name and data-type 
	//e.g. 'String one' returns {'type' : 'String', 'identifier' : 'one'}
	function var_string_to_hash(var_string){
		var var_hash = {};
		if(var_string.match(/^\/\//)){
			var_hash.comment = true;
			var_hash.identifier = var_string;
			return var_hash;
		}
		var var_split = var_string.split(' ').filter(Boolean);
		//test for String one, two, three;
		var nested_array_dec = split_nested_var_declarations([var_split.shift(), var_split.join('')]);
		if(nested_array_dec){
			return nested_array_dec;
		}
		var_split = var_string.split(' ').filter(Boolean); //because was mutilated earlier
		if(var_split.length === 2){
			//e.g. String name;
			var_hash.type = var_split[0];
			var_hash.identifier = var_split[1];
		}
		else{
			var_hash.invalid = true;	
			var_hash.identifier = var_string;
		}

		return var_hash;
	}

	//splits String one, two, three into:
	//String one; String two; String three;
	//return array of objects [{type:'String', name:'one'}, {type:'String', name:'two'}, {type:'String', name:'three'}]
	function split_nested_var_declarations(var_array){
		if(var_array.length < 2){
			return false;
		}
		var name_split = var_array[1].split(',').filter(Boolean);
		if(name_split.length === 1){
			return false;
		}
		else{
			var type = var_array[0];
			var var_hash_array = name_split.map(function(var_sub_array_element){
				return {
					'type': type,
					'identifier' : var_sub_array_element
				};
			});
		}
		return var_hash_array;
	}

})();
