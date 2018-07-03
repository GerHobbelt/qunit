// Detect if the current browser supports `onunhandledrejection` (avoiding
// errors for browsers without the capability)
var HAS_UNHANDLED_REJECTION_HANDLER = "onunhandledrejection" in window;

// Duck-punch onUnhandledRejection so we can check the invocation of the handler.
var originalOnUnhandledRejection = QUnit.onUnhandledRejection;
var originalOnError = QUnit.onError;

if ( HAS_UNHANDLED_REJECTION_HANDLER ) {
	QUnit.module( "Handled Rejections inside test context", function( /* hooks */ ) {
		/*
		hooks.beforeEach( function( assert ) {
			var originalPushResult = assert.pushResult;
			assert.pushResult = function( resultInfo ) {

				// Inverts the result so we can test failing assertions
				resultInfo.result = !resultInfo.result;
				originalPushResult( resultInfo );
			};
		} );
		*/

		QUnit.test( "test passes just fine, but has a rejected promise", function( assert ) {
			assert.expect( 2 );
			assert.ok( true );

			const done = assert.async();

			Promise.resolve().then( function() {
				throw new Error( "Error thrown in non-returned promise!" );
			} ).catch( function( error ) {
				assert.ok( /Error thrown in non-returned promise/.test( error.message ), "expected user-coded exception" );
			} );

			// prevent test from exiting before unhandled rejection fires
			setTimeout( done, 10 );
		} );

	} );

	QUnit.module( "Unhandled Rejections inside test context", function( hooks ) {
		var originalPushResult;

		hooks.beforeEach( function( assert ) {

			// Duck-punch pushResult so we can check test name and assert args.
			originalPushResult = assert.pushResult;

			assert.pushResult = function( resultInfo ) {

				// Restore pushResult for this assert object, to allow following assertions.
				this.pushResult = originalPushResult;

				this.strictEqual( this.test.testName, "test passes just fine, but has a rejected promise", "Test is appropriately named" );

				this.deepEqual(
					resultInfo.message,
					"okay",
					// {
					// 	message: "Error message",
					// 	source: "filePath.js:1",
					// 	result: false,
					// 	actual: {
					// 		message: "Error message",
					// 		fileName: "filePath.js",
					// 		lineNumber: 1,
					// 		stack: "filePath.js:1"
					// 	}
					// },
					"Expected assert.pushResult to be called with correct args"
				);
			};
		} );

		hooks.afterEach( function() {
			QUnit.config.current.pushResult = originalPushResult;
		} );

		hooks.before( function( assert ) {

			QUnit.onUnhandledRejection = function( reason ) {
				console.error( "onUnhandledRejection:", reason );
				assert.ok( /Error thrown in non-returned promise/.test( reason.message ) );

				return true;
			};

			// Handle an unhandled exception. By convention, returns true if further
			// error handling should be suppressed and false otherwise.
			QUnit.onError = function( reason ) {
				debugger;

				console.error( "onError:", reason );
				console.error( "onError test:", /outside of a test context/.test( reason.message ) );

				QUnit.onUnhandledRejection = originalOnUnhandledRejection;
				QUnit.onError = originalOnError;

				return true;
			};

		} );

		hooks.after( function() {
			QUnit.onUnhandledRejection = originalOnUnhandledRejection;
			QUnit.onError = originalOnError;
		} );

		QUnit.test( "test passes just fine, but has a rejected promise", function( assert ) {
			assert.expect( 2 );
			assert.ok( true );

			const done = assert.async();

			Promise.resolve().then( function() {

				throw new Error( "Error thrown in non-returned promise!" );

			} );

			// prevent test from exiting before unhandled rejection fires
			setTimeout( done, 10 );
		} );
	} );

	QUnit.module( "Unhandled Rejections outside test context 1", function( hooks ) {

		hooks.before( function( assert ) {

			console.error( "BEFORE" );

		} );

		hooks.after( function( assert ) {

			console.error( "AFTER" );
			QUnit.onUnhandledRejection = originalOnUnhandledRejection;
			QUnit.onError = originalOnError;

		} );

		QUnit.onUnhandledRejection = function( reason ) {
			debugger;

			console.error( "onUnhandledRejection:", reason );
			console.error( "onUnhandledRejection test:", /outside of a test context/.test( reason.message ) );

			QUnit.onUnhandledRejection = originalOnUnhandledRejection;

			return true;
		};

		// Handle an unhandled exception. By convention, returns true if further
		// error handling should be suppressed and false otherwise.
		QUnit.onError = function( reason ) {
			debugger;

			console.error( "onError:", reason );
			console.error( "onError test:", /outside of a test context/.test( reason.message ) );

			QUnit.onUnhandledRejection = originalOnUnhandledRejection;
			QUnit.onError = originalOnError;

			return true;
		};

		QUnit.test( "test passes just fine", function( assert ) {
			console.error( "TEST" );
			assert.expect( 2 );
			assert.ok( true );

			const done = assert.async();

			Promise.resolve().then( function() {
				console.error( "THEN" );
				assert.ok( true );
			} );

			// prevent test from exiting before unhandled rejection fires
			setTimeout( done, 10 );
		} );

		// Actual test (outside QUnit.test context)

		console.error( "ON-UNHANDLED" );
		QUnit.onUnhandledRejection( {
			message: "Error message: outside of a test context",
			fileName: "filePath.js",
			lineNumber: 149,
			stack: "filePath.js:149"
		} );

		console.error( "MODULE-END" );
	} );

	QUnit.module( "Unhandled Rejections outside test context 2", function( hooks ) {

		hooks.before( function( assert ) {

			console.error( "BEFORE" );

		} );

		hooks.after( function( assert ) {

			console.error( "AFTER" );
			QUnit.onUnhandledRejection = originalOnUnhandledRejection;
			QUnit.onError = originalOnError;

		} );

		QUnit.onUnhandledRejection = function( reason ) {
			debugger;

			console.error( "onUnhandledRejection:", reason );
			console.error( "onUnhandledRejection test:", /outside of a test context/.test( reason.message ) );

			QUnit.onUnhandledRejection = originalOnUnhandledRejection;

			return true;
		};

		// Handle an unhandled exception. By convention, returns true if further
		// error handling should be suppressed and false otherwise.
		QUnit.onError = function( reason ) {
			debugger;

			console.error( "onError:", reason );
			console.error( "onError test:", /outside of a test context/.test( reason.message ) );

			QUnit.onUnhandledRejection = originalOnUnhandledRejection;
			QUnit.onError = originalOnError;

			return true;
		};

		QUnit.test( "test passes just fine", function( assert ) {
			console.error( "TEST" );
			assert.expect( 2 );
			assert.ok( true );

			const done = assert.async();

			Promise.resolve().then( function() {
				console.error( "THEN" );
				assert.ok( true );
			} );

			// prevent test from exiting before unhandled rejection fires
			setTimeout( done, 10 );
		} );

		// Actual test (outside QUnit.test context)

		console.error( "ON-UNHANDLED" );

		var ex = new Error( "Error thrown outside of a test context!" );
		throw ex;

		console.error( "MODULE-END" );
	} );

	QUnit.module( "Unhandled Rejections outside test context 3", function( hooks ) {

		hooks.before( function( assert ) {

			console.error( "BEFORE" );

		} );

		hooks.after( function( assert ) {

			console.error( "AFTER" );
			QUnit.onUnhandledRejection = originalOnUnhandledRejection;
			QUnit.onError = originalOnError;

		} );

		QUnit.onUnhandledRejection = function( reason ) {
			debugger;

			console.error( "onUnhandledRejection:", reason );
			console.error( "onUnhandledRejection test:", /outside of a test context/.test( reason.message ) );

			QUnit.onUnhandledRejection = originalOnUnhandledRejection;

			return true;
		};

		// Handle an unhandled exception. By convention, returns true if further
		// error handling should be suppressed and false otherwise.
		QUnit.onError = function( reason ) {
			debugger;

			console.error( "onError:", reason );
			console.error( "onError test:", /outside of a test context/.test( reason.message ) );

			QUnit.onUnhandledRejection = originalOnUnhandledRejection;
			QUnit.onError = originalOnError;

			return true;
		};

		QUnit.test( "test passes just fine", function( assert ) {
			console.error( "TEST" );
			assert.expect( 2 );
			assert.ok( true );

			const done = assert.async();

			Promise.resolve().then( function() {
				console.error( "THEN" );
				assert.ok( true );
			} );

			// prevent test from exiting before unhandled rejection fires
			setTimeout( done, 10 );
		} );

		// Actual test (outside QUnit.test context)

		console.error( "ON-UNHANDLED" );

		Promise.reject( new Error( "outside of a test context" ) );

		console.error( "MODULE-END" );
	} );

}
