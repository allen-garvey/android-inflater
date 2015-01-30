//requires js_util.js

var android_inflate_xml = (function(){
	return {'inflate_xml' : function(xmlStr, options){
			return inflated_xml(xmlStr, options);
		}
	};

	function inflated_xml(xmlStr, options){
		var element_list = get_element_array(xmlStr, options);
		var parent_element_name = get_doc_element_type(xmlStr);
		var declaration_string;
		if(parent_element_name === 'resources'){
			declaration_string = declaration_string_from_resources(element_list, options);
		}
		else{
			declaration_string = declaration_string_from_layout(element_list, options);
		}
		console.log(declaration_string);
		return declaration_string;
	}

	function get_doc_element_type(xmlStr){
		return parseXML(xmlStr).documentElement.nodeName;
	}

	function get_element_array(xmlStr){
		var parsed_xml = parseXML(xmlStr);
		var node_list = parsed_xml.documentElement.childNodes;
		var element_list = map_collection(node_list, function(node){
			var type = node.nodeName.match(/-array$/) ? xml_array_name_to_java(node.nodeName) : node.nodeName;
			return {
				type : type,
				name : node.getAttribute('name'),
				id : node.getAttribute('android:id')
			};
		});
		return element_list;
	}


	function declaration_string_from_resources(element_list, options){
		var declaration_string = get_string_from_resources_comment(options);
		element_list.map(function(element){
			var visibility = options.visibility ? options.visibility + ' ' : '';
			var name = options.camelCase ? element.name.to_camelCase() : element.name;
			var makeFinal = options.makeFinal ? 'final ' : '';
			declaration_string = declaration_string + visibility + makeFinal + element.type.capitalize() + " " + name + ';\n';
		});
		return declaration_string;
	}

	function declaration_string_from_layout(element_list, options){
		var declaration_string = get_string_from_layout_comment(options);
		element_list.map(function(element){
			var visibility = options.visibility ? options.visibility + ' ' : '';
			var makeFinal = options.makeFinal ? 'final ' : '';
			var id = element.id.replace(/@.*\//,'');
			id = options.camelCase ? id.to_camelCase() : id;
			declaration_string = declaration_string + visibility + makeFinal + element.type + " " + id + ';\n';
		});
		return declaration_string;
	}

	//converts string-array to String[]
	function xml_array_name_to_java(array_name){
		var java_array_name = array_name.replace(/-array$/, '');
		java_array_name = java_array_name === 'string' ? 'String' : java_array_name;
		return java_array_name + '[]';
	}


	function get_string_from_layout_comment(options){
		return '//declare ui elements\n';
	}
	function get_string_from_resources_comment(options){
		return '//declare resources\n';
	}



})();