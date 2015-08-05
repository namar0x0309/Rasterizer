/*!
 * Copyright Nassim Amar 2012
 */
 
/*--Utility Functions --------------------------------------------------------*/
function SwapNumbers( a, b ) {
	a = b - a;
	b = b - a; 
	a = b + a; 
}

Object.prototype.clone = function() {
    var newObj = ( this instanceof Array ) ? [] : {};
    for( i in this) {
        if( i == 'clone' ) continue; 
        if( this[i] && typeof this[i] == "object" ) {
            newObj[i] = this[i].clone(); 
        } else newObj[i] = this[i];
        } return newObj;
}

function SourceCodeInclude( src ) {
    if( document.createElement && document.getElementsByTagName ) {
        
        var head_tag = document.getElementsByTagName( 'head' )[0];
        var script_tag = document.createElement( 'script' );
        script_tag.setAttribute( 'type', 'text/javascript' );
        script_tag.setAttribute( 'src', src );
        head_tag.appendChild( script_tag );
    }
}