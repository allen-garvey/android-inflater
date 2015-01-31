var android_inflate = (function(){
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

	////******************unused - preserve if decide to preserve comments in generated code**************************************
	//takes string of java text and returns array of cleaned up variables
	function java_string_to_array(java_text){
		//1.adds semicolon to java comments so that they are preserved in split; 2. removes extra white-space between variables; 3. removes extra white-space within variables; 4. splits variables on semi-colon 5.filters out empty strings in array; 
		var split_text = java_text.replace(/\/\/(.)*\n|\/\/(.)*$/g, "$&;").replace(/[\s]*;[^A-Z\/]*/gi, ';').replace(/\s+/g, ' ').split(';').filter(Boolean);
		return split_text;
	}

	//takes string of java text and returns array of cleaned up variables with comments removed
	function java_string_to_array_sans_comments(java_text){
		//1.strips multi-line comments (see http://ostermiller.org/findcomment.html) 2.strips beginning space, single-line comments and reserved words as they are unneeded and make parsing later easier 3. removes extra white-space between variables; 4. removes extra white-space within variables; 5. splits variables on semi-colon 6.filters out empty strings in array; 
		var split_text = java_text.replace(/\/\*([^*]|[\r\n]|(\*+([^*\/]|[\r\n])))*\*+\//g, ' ').replace(/\/\/(.)*\n|\/\/(.)*$|\bstatic\b|\bfinal\b|\bpublic\b|\bprivate\b|\bprotected\b|^\s+/g, "").replace(/[\s]*;[^A-Z\/]*/gi, ';').replace(/\s+/g, ' ').split(';').filter(Boolean);
		return split_text;
	} 

	function var_array_to_hash_array(var_array){
		var hash_array = var_array.map(function(var_string){
			return var_string_to_hash(var_string);
		});
		//String one, two, three is returned as ['String one', 'String two', 'String three'] so this flattens the list
		var merged = [];
		return merged.concat.apply(merged, hash_array);
	}

	//creates object by parsing string for name, datatype and visibility(unused for now)
	function var_string_to_hash(var_string){
		var var_hash = {};
		if(var_string.match(/^\/\//)){
			var_hash.comment = true;
			var_hash.name = var_string;
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
			var identifier = get_identifier(var_hash.type);
			var_hash[identifier] = var_split[1];
		}
		else{
			var_hash.invalid = true;	
			var_hash.name = var_string;
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
			var identifier =  get_identifier(type);
			var var_hash_array = name_split.map(function(var_sub_array_element){
				var var_obj = {'type': type};
				var_obj[identifier] = var_sub_array_element;
				return var_obj;	
			});
		}
		return var_hash_array;
	}

	function get_identifier(type){
		var identifier = type.match(/^String$|\[\]$/) ? 'name' : 'id';
		return identifier;
	}

})();
