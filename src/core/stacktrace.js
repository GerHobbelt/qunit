// Doesn't support IE6 to IE9, it will return undefined on these browsers
// See also https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error/Stack
function extractStacktrace( e, offset, produceStack ) {
	offset = offset === undefined ? 4 : offset;

	var stack, include, i;

	if ( e.stacktrace ) {

		// Opera 12.x
		if (!produceStack) {
			return e.stacktrace.split( "\n" )[ offset + 3 ];
		} else {
			return e.stacktrace.split( "\n" ).slice( offset + 3 );
		}
	} else if ( e.stack ) {

		// Firefox, Chrome, Safari 6+, IE10+, PhantomJS and Node
		stack = e.stack.split( "\n" );
		if ( /^error$/i.test( stack[ 0 ] ) ) {
			stack.shift();
		}
		if ( fileName ) {
			include = [];
			for ( i = offset; i < stack.length; i++ ) {
				if ( stack[ i ].indexOf( fileName ) !== -1 ) {
					break;
				}
				include.push( stack[ i ] );
			}
			if ( include.length ) {
				if (!produceStack) {
					return include.join( "\n" );
				} else {
					return include;
				}
			}
		}
		if (!produceStack) {
			return stack[ offset ];
		} else {
			return stack.slice( offset );
		}
	} else if ( e.sourceURL ) {

		// Safari <= 6 only
		// exclude useless self-reference for generated Error objects
		if ( /qunit.js$/.test( e.sourceURL ) ) {
			return;
		}

		// for actual exceptions, this is useful
		if (!produceStack) {
			return e.sourceURL + ":" + e.line;
		} else {
			return [ e.sourceURL + ":" + e.line ];
		}
	}
}

function sourceFromStacktrace( offset, produceStack ) {
	var error = new Error();

	// Support: Safari <=7 only, IE <=10 - 11 only
	// Not all browsers generate the `stack` property for `new Error()`, see also #636
	if ( !error.stack ) {
		try {
			throw error;
		} catch ( err ) {
			error = err;
		}
	}
	return extractStacktrace( error, offset, produceStack );
}

