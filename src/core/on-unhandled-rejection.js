import { test } from "../test";

import config from "./config";
import { extend } from "./utilities";
import { sourceFromStacktrace } from "./stacktrace";

// Handle an unhandled rejection
export default function onUnhandledRejection( reason ) {
	const resultInfo = {
		result: false,
		message: reason.message || "error",
		actual: reason,
		source: reason.stack || sourceFromStacktrace( 3 )
	};

	const currentTest = config.current;
	let ret;

	if ( currentTest && currentTest.onUnhandledRejection ) {
		ret = currentTest.onUnhandledRejection( reason );
	}
	if ( ret !== true && config.currentModule && config.currentModule.onUnhandledRejection ) {
		ret = config.currentModule.onUnhandledRejection( reason );
	}
	if ( ret !== true ) {
		if ( currentTest ) {
			currentTest.assert.pushResult( resultInfo );
		} else {
			test( "global failure", extend( function( assert ) {
				assert.pushResult( resultInfo );
			}, { validTest: true } ) );
		}
	}
}

