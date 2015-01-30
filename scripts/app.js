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
			addButtonOnClickListener : false
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
					var var_declarations = android_inflate_xml.inflate_xml(document.getElementById('xml_input').value, options);
					document.getElementById('results2').value = var_declarations + '\n\n' + android_inflate.display_inflate_android_ui(var_declarations, options);
				}
				else{
					var options = {};
					document.getElementById('results').value = android_inflate.display_inflate_android_ui(document.getElementById('java_input').value, options);
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