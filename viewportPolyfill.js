/*
* Viewport polyfill created by Jordy van Domselaar: jordy.van.domselaar@outlook.com
* E-mail me if you have any questions or improvements!
*
*
************************************************************************
* USAGE GUIDE *                                                        *
* Set cssFile to your css file...                                      *
* Run node viewportPolyfill.js                                         *
* If you get an error, create folder "compiled" in your current folder.*
* Add compiled/viewportPolyfill.js in your html script tag             *
* run viewPoly()                                                       *
************************************************************************
*/
var cssFile = 'test.css';

var fs = require ('fs'),
	match,
	matches = [],
	code = '',
	codeStart = "function viewPoly(){\n var sHeight = window.innerHeight,\n sWidth = window.innerWidth;\n",
	codeEnd = '}',
	codeFinal = '',
	source,
	css = [],
	i,
	element,
	elements = [],
	addCode;

fs.readFile(cssFile,'utf8',function(error,source){
	if(error){
		throw error;
	}


	while(element = source.match(/(#|\.)?([a-zA-Z0-9]+){([\s\S]+?)}/)){
		elements.push(element);
		source = source.replace(element[0],'');
	}

	// Now to loop trough them all
	for(i = 0;i < elements.length;i++){
		var inserted = false; // We don't want to insert the same element dozens of times...
		while(match = elements[i][3].match(/([a-zA-Z-]+):\s*([0-9]+)(vh|VH|vw|VW|vmin|VMIN|vmax|VMAX)/)){
			element = elements[i];
			/*
				element[0] = The whole thing
				element[1] = # for id or . for class
				element[2] = Element name
				element[3] = Styles for this element
			*/
			// Let's convert things such as border-width to borderWidth
				var stripe,  //Used to determine - location
					before, // Both used to concat
					after,
					toUpper;
				while(match[1].search('-') != -1){
					stripe = match[1].search('-');
					match[1] = match[1].replace('-','');
					before = match[1].substr(0,stripe);
					after = match[1].substr(stripe+1,match[1].length);
					toUpper = match[1].substr(stripe,1).toUpperCase();
					match[1] = before+toUpper+after;
					
				}

			// Let's fill the code variable		
			var multi = false; // class and tagname are multiple elements	

			
				if(element[1] === '#'){
					addCode+= "var "+element[2]+" = document.getElementById('"+element[2]+"');\n";
				}
				else if(element[1] === '.'){
					addCode+= "var "+element[2]+" = document.getElementsByClassName('"+element[2]+"');\n";
					multi = true;
				}
				else{
					addCode+= "var "+element[2]+" = document.getElementsByTagName('"+element[2]+"');\n";
					multi = true;
				}
				if(!inserted){
					code += addCode;

				inserted = true;
			}
				// Screen width and height calculation


			if(match[3] == 'vh'){
				if(multi === false){
				code+= element[2]+".style."+match[1]+" = sHeight / 100 * "+match[2]+"+'px';\n";
				}
				else {
					
					code+= "for(var i = 0; i < "+element[2]+".length; i++)\n{\n"+element[2]+"[i].style."+match[1]+" = sHeight / 100 * "+match[2]+" + 'px';\n}\n";
				}
			}
			else if(match[3] == 'vw'){

				if(multi === false){
				code+= element[2]+".style."+match[1]+" = sWidth / 100 * "+match[2]+"+'px';\n";
				}
				else{
					
					code+= "for(var i = 0; i < "+element[2]+".length; i++)\n{\n"+element[2]+"[i].style."+match[1]+" = sWidth / 100 * "+match[2]+" + 'px';\n}\n";
				}
			}
			else if(match[3] == 'vmin'){

				if(multi === false){
				code+= "if(sWidth < sHeight){\n"+element[2]+".style."+match[1]+" = sWidth / 100 * "+match[2]+" + 'px';\n}\nelse{\n"+element[2]+".style."+match[1]+" = sHeight / 100 * "+match[2]+" + 'px';\n}\n";
				}
				else{
					code+= "for(var i = 0; i < "+element[2]+".length; i++)\n{\nif(sWidth < sHeight){\n"+element[2]+".style."+match[1]+" = sWidth / 100 * "+match[2]+" + 'px';\n}\nelse{\n"+element[2]+".style."+match[1]+" = sHeight / 100 * "+match[2]+" + 'px';\n}\n}\n";
				}
			}
			else if(match[3] == 'vmax'){

				if(multi === false){
				code+= "if(sWidth > sHeight){\n"+element[2]+".style."+match[1]+" = sWidth / 100 * "+match[2]+" + 'px';\n}\nelse{\n"+element[2]+".style."+match[1]+" = sHeight / 100 * "+match[2]+" + 'px';\n}\n";
				}
				else{
					code+= "for(var i = 0; i < "+element[2]+".length; i++)\n{\nif(sWidth < sHeight){\n"+element[2]+".style."+match[1]+" = sWidth / 100 * "+match[2]+" + 'px';\n}\nelse{\n"+element[2]+".style."+match[1]+" = sHeight / 100 * "+match[2]+" + 'px';\n}\n}\n";
				}
			}
			else{
				code+= element[2]+" does not have vh, vm.";
			}

			// And remove used code from the variable
			elements[i][3] = elements[i][3].replace(match[0],'');
		}
	}


// Lets create the compiled folder if it doesn't exist yet

if(fs.exists('./compiled') == false){
	fs.mkdir('./compiled');
}


codeFinal = codeStart+code+codeEnd;


fs.writeFile('./compiled/viewportPolyfill.js',codeFinal,function(error){
		if(error){
			throw error;
		}
	});


});