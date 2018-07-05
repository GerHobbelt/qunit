import { pushFailure, test } from "../test";

import config from "./config";
import { extend } from "./utilities";

// Handle an unhandled exception. By convention, returns true if further
// error handling should be suppressed and false otherwise.
// In this case, we will only suppress further error handling if the
// "ignoreGlobalErrors" configuration option is enabled.
export default function onError( error, ...args ) {
	let ret;

	if ( config.current && config.current.onError ) {
		ret = config.current.onError( error );
	}
	if ( ret !== true && config.currentModule && config.currentModule.onError ) {
		ret = config.currentModule.onError( error );
	}
	if ( ret === true ||
		( config.currentModule && config.currentModule.ignoreGlobalErrors ) ||
		( config.current && config.current.ignoreGlobalErrors )
	) {
	  return true;
	}

	if ( config.current ) {
		pushFailure( error.message, error.fileName + ":" + error.lineNumber, ...args );
	} else {
		test( "global failure", extend( function() {
			pushFailure( error.message, error.fileName + ":" + error.lineNumber, ...args );
		}, { validTest: true } ) );
	}

	return false;
}
