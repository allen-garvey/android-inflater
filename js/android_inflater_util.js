String.prototype.capitalize = String.prototype.capitalize || function(){
	var split = this.split(' ').filter(Boolean);
	var len = split.length;
	var capitalized_string = '';
	for (var i=0;i<len;i++) {
		capitalized_string = capitalized_string + split[i].charAt(0).toUpperCase() + split[i].slice(1).toLowerCase() + " ";
	}
	return capitalized_string.slice(0, capitalized_string.length-1);
}
//converts string with underscores to camelCase. string is the same if the string doesn't contain underscores or only contains a leading underscore e.g. _hello
String.prototype.to_camelCase = String.prototype.convert_to_camelCase || function(){
    if(!this.match(/.+_/)){return this;}
    var split = this.split('_').filter(Boolean);
    var len = split.length;
    var camelCaseString = '';
    for (var i=0;i<len;i++) {
        if(i===0){
            camelCaseString = camelCaseString + split[i].toLowerCase();
        }
        else{
            camelCaseString = camelCaseString + split[i].capitalize();    
        }
    }
    return camelCaseString;
}
//to map array-like objects such as collections- returns array with function applied
function map_collection(collection, callback){
    var len = collection.length;
    var newArray = [];
    for(var i=0; i<len;i++){
        newArray.push(callback(collection[i]));
    }
    return newArray;
}

//returns cross browser compatible (back to i.e. 6) xml dom object from xml string
var parseXML = (function(){

    if (typeof window.DOMParser != "undefined") {
        return function(xmlStr) {
            return ( new window.DOMParser() ).parseFromString(xmlStr, "text/xml");
        };
    } else if (typeof window.ActiveXObject != "undefined" &&
           new window.ActiveXObject("Microsoft.XMLDOM")) {
        return function(xmlStr) {
            var xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM");
            xmlDoc.async = "false";
            xmlDoc.loadXML(xmlStr);
            return xmlDoc;
        };
    } else {
        throw new Error("No XML parser found");
    }
})();