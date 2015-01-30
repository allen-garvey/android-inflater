var android_inflate = (function(){
	//main driver function
	return {
		display_inflate_android_ui: function (input, options){
		var inflatedUI = android_inflate(input);
		return format_inflated_var(inflatedUI);
		}
	};

	//generates inflated code string based on variable type
	function android_inflate(java_text){
		var var_array = java_string_to_array_sans_comments(java_text);
		var hash_array = var_array_to_hash_array(var_array);
		var inflated_ui_array = hash_array.map(function(var_obj){
			switch(var_obj.type){
			case 'invalid':
				return get_error_msg(var_obj);
				break;
			case 'comment':
				return var_obj.name;
				break;
			case "String":
				return unpack_res_string(var_obj);
				break;
			default:
				if(var_obj.type.match(/\[\]/)){
					return unpack_res_array(var_obj);
				}
				else{
					return unpack_ui_element(var_obj);
				}
			}
		});

		return inflated_ui_array;
	}

	//takes array of inflated android element strings and converts it for output
	function format_inflated_var(var_array){
		var formatted_var = get_opening_comment();
		var len = var_array.length;
		for (var i=0;i<len;i++) {
			formatted_var = formatted_var + var_array[i] + "\n";
		};
		return formatted_var;
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
		var hash_array = [];
		var len = var_array.length;
		for (var i=0;i<len;i++) {
			var hash = var_string_to_hash(var_array[i]);
			if(Object.prototype.toString.call(hash) === '[object Array]'){
				var len2 = hash.length;
				for(var j=0;j<len2;j++){
					hash_array.push(hash[j]);
				}
			}
			else{
				hash_array.push(hash);
			}
		}
		return hash_array;
	}

	//creates object by parsing string for name, datatype and visibility(unused for now)
	function var_string_to_hash(var_string){
		var var_hash = {};
		if(var_string.match(/^\/\//)){
			var_hash.type = "comment";
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
		switch(var_split.length){
			case 2:
				//e.g. String name;
				var_hash.name = var_split[1];
				var_hash.type = var_split[0];
				break;
			default:
				var_hash.type = "invalid";	
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
		var len = name_split.length;
		if(len === 1){
			return false;
		}
		else{
			var var_hash_array = [];
			for(var i=0;i<len;i++){
				var_hash_array.push({type: var_array[0], name:name_split[i]});
			}
		}
		return var_hash_array;
	}

	function unpack_ui_element(var_hash){
		return var_hash.name + " = (" + var_hash.type + ") findViewById(R.id." + var_hash.name + ");";
	}

	function unpack_res_string(var_hash){
		return var_hash.name + " = getResources().getString(R.string." + var_hash.name + ");";
	}

	function unpack_res_array(var_hash){
		var var_type = var_hash.type.replace("[]", "");
		var_type = var_type.capitalize();
		return var_hash.name + " = getResources().get" + var_type + "Array(R.array." + var_hash.name + ");";
	}

	function get_error_msg(error_var){
		return "//" + error_var.name +  " is not a valid variable declaration";
	}
	function get_opening_comment(){
		return "//Inflate UI\n";
	}
})();
