(function(){
	var app = angular.module('AndroidInflater', []);
	app.controller('TabController', ['$scope', function($scope) {
		$scope.currentTab = 0;
		$scope.visibility_options = [{label : 'private', value : 'private'}, {label : 'public', value : 'public'}, {label : 'none', value : ''}];
  		$scope.xml_opt_visibility = $scope.visibility_options[0].value;
		$scope.xml_options = {
			camelCase : false,
			visibility : $scope.xml_opt_visibility,
			makeFinal : false,
			addButtonOnClickListener : true
		};
		$scope.var_declaration_options = {
			addButtonOnClickListener : true
		};
		$scope.isSelectEnabled = function(){
			var id = $scope.currentTab === 0 ? 'xml_output' : 'java_output';
			return $scope[id] === 0;
		};
		$scope.setTab = function(num){$scope.currentTab = num; $scope.isSelectEnabled = false;$scope.selectInput();};
		$scope.showTab = function(num){return num === $scope.currentTab;};
		$scope.inflate = function(input_id, output_id) {
				if($scope.currentTab === 0)  {
					var options = $scope.xml_options;
					options.visibility = $scope.xml_opt_visibility;
					var input_val = document.getElementById('xml_input').value;
					try{
						var inflated_xml = android_inflate_xml.inflate_xml(input_val, options);
						document.getElementById('results2').value = inflated_xml.declaration + '\n\n' + inflated_xml.inflated_java;
					}
					catch(err){
						document.getElementById('results2').value = input_val + " could not be parsed.";	
					}
					
				}
				else{
					var options = $scope.var_declaration_options;
					var element_array = android_inflate.element_array_from_declaration(document.getElementById('java_input').value, options);
					document.getElementById('results').value = android_inflate_xml.inflate_element_list(element_array, options);
				}
				$scope.isSelectEnabled = true;
			};
		
		$scope.selectResults = function(){
				if($scope.currentTab === 0)  {
					select_textarea('results2');
				}
				else{
					select_textarea('results');
				}
			};
		$scope.selectInput = function(){
				if($scope.currentTab === 0)  {
					select_textarea('xml_input');
				}
				else{
					select_textarea('java_input');
				}
			};


	}]);


	
})();