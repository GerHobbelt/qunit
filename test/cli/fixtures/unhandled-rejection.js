"use strict";

QUnit.module( "Handled Rejections inside test context", function() {
	QUnit.config.currentModule.onError = function () {
		throw new Error('module level onError handler should not be invoked');
	};
	QUnit.config.currentModule.onUnhandledRejection = function () {
		throw new Error('module level onUnhandledRejection handler should not be invoked');
	};

	QUnit.test( "test passes just fine, but has a rejected promise", function( assert ) {
		assert.expect( 3 );
		assert.ok( true ); // #1

		const done = assert.async();

		Promise.resolve().then( function() {
			assert.ok( true ); // #2

			// throwing a non-Error here because stack trace representation
			// across Node versions is not stable (they continue to get better)
			throw {
				message: "Error thrown in non-returned promise!",
				stack: `Error: Error thrown in non-returned promise!
	at /some/path/wherever/cli/fixtures/unhandled-rejection.js:17:11`
			};
		} ).catch( function( error ) {
			 // #3:
			assert.ok( /Error thrown in non-returned promise/.test( error.message ), "expected user-coded exception" );
		} );

		// prevent test from exiting before unhandled rejection fires
		setTimeout( done, 10 );
	} );

} );

QUnit.module( "Unhandled Rejections inside test context", function( hooks ) {
	// QUnit.config.currentModule.ignoreGlobalErrors = true;
	QUnit.config.currentModule.onError = function () {
		throw new Error('module level onError handler should not be invoked');
	};
	QUnit.config.currentModule.onUnhandledRejection = function () {
		throw new Error('module level onUnhandledRejection handler should not be invoked');
	};

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
		QUnit.config.current.assert.pushResult = originalPushResult;
	} );

	QUnit.test( "test passes just fine, but has a rejected promise", function( assert ) {
		assert.expect( 3 ); // note the this.deepEqual() further above: that's the 3rd assert!
		assert.ok( true );

		const done = assert.async();

		Promise.resolve().then( function() {
			assert.ok( true );

			// throwing a non-Error here because stack trace representation
			// across Node versions is not stable (they continue to get better)
			throw {
				message: "Error thrown in non-returned promise!",
				stack: `Error: Error thrown in non-returned promise!
	at /some/path/wherever/cli/fixtures/unhandled-rejection.js:61:11`
			};
		} );

		// prevent test from exiting before unhandled rejection fires
		setTimeout( done, 10 );
	} );
} );

QUnit.module( "Unhandled Rejections outside test context 1", function( hooks ) {
	var count = 0;
	QUnit.config.currentModule.onError = function () {
		throw new Error('module level onError handler should not be invoked');
	};
	QUnit.config.currentModule.onUnhandledRejection = function () {
		// QUnit.config.currentModule.ignoreGlobalErrors = true;
		count++;
		return (count === 1);
	};

	QUnit.test( "test passes just fine", function( assert ) {
		assert.expect( 2 );
		assert.ok( true );

		const done = assert.async();

		Promise.resolve().then( function() {
			assert.ok( true );
		} );

		// prevent test from exiting before unhandled rejection fires
		setTimeout( done, 10 );
	} );

	// Actual test (outside QUnit.test context)

	QUnit.onUnhandledRejection( {
		message: "Error message: outside of a test context",
		fileName: "filePath.js",
		lineNumber: 149,
		stack: "filePath.js:149"
	} );
} );

QUnit.module( "Unhandled Rejections outside test context 2", function( hooks ) {
	var count = 0;
	// QUnit.assert.expect( 1 );
	QUnit.config.currentModule.onError = function () {
		// QUnit.config.currentModule.ignoreGlobalErrors = true;
		count++;
		return count === 1;
	};
	QUnit.config.currentModule.onUnhandledRejection = function () {
		throw new Error('module level onUnhandledRejection handler should not be invoked');
	};

	QUnit.test( "test passes just fine", function( assert ) {
		assert.expect( 1 );
		assert.ok( true );
	} );

	// Actual test (outside QUnit.test context)

	// rejecting with a non-Error here because stack trace representation
	// across Node versions is not stable (they continue to get better)
	var ex = {
		message: "Error thrown outside of a test context!",
		stack: `Error: outside of a test context
	at Object.<anonymous> (/some/path/wherever/cli/fixtures/unhandled-rejection.js:118:18)`
	};
  
	throw ex;
} );

QUnit.module( "Unhandled Rejections outside test context 3", function( hooks ) {
	var count = 0;
	// QUnit.config.currentModule.ignoreGlobalErrors = true;
	QUnit.config.currentModule.onError = function () {
		throw new Error('module level onError handler should not be invoked');
	};
	QUnit.config.currentModule.onUnhandledRejection = function () {
		count++;
		return count === 1;
	};

	QUnit.test( "test passes just fine", function( assert ) {
		assert.expect( 2 );
		assert.ok( true );

		const done = assert.async();

		Promise.resolve().then( function() {
			assert.ok( true );
		} );

		// prevent test from exiting before unhandled rejection fires
		setTimeout( done, 10 );
	} );

	// Actual test (outside QUnit.test context)

	// rejecting with a non-Error here because stack trace representation
	// across Node versions is not stable (they continue to get better)
	Promise.reject( {
		message: "outside of a test context",
		stack: `Error: outside of a test context
	at Object.<anonymous> (/some/path/wherever/cli/fixtures/unhandled-rejection.js:118:18)`
	} );
} );

QUnit.module( "Unhandled Rejections inside test context: cope with buggy/cyclic afterEach() userland code", function( hooks ) {
	// QUnit.config.currentModule.ignoreGlobalErrors = true;
	QUnit.config.currentModule.onError = function () {
		throw new Error('module level onError handler should not be invoked');
	};
	QUnit.config.currentModule.onUnhandledRejection = function () {
		throw new Error('module level onUnhandledRejection handler should not be invoked');
	};

	var originalPushResult;

	hooks.beforeEach( function( assert ) {

		// Duck-punch pushResult so we can check test name and assert args.
		originalPushResult = assert.pushResult;

		assert.pushResult = function( resultInfo ) {

			// Restore pushResult for this assert object, to allow following assertions.
			this.pushResult = originalPushResult;

			this.strictEqual( this.test.testName, "regression-testing the bug-triggering test", "Test is appropriately named" );

			// this is an assert.deepEqual() call 'in disguise':
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
		/* good: */ // QUnit.config.current.assert.pushResult = originalPushResult;
		/* bad: */     QUnit.config.current.pushResult = originalPushResult;
	} );

	QUnit.test( "regression-testing the bug-triggering test", function( assert ) {
		assert.expect( 2 ); // this count is WRONG: note the this.deepEqual() further above: that's a 3rd assert!
		// ^^^^^ this wrong assumption triggers a error report at the end of this test...
		// ... and that will cause a call stack overflow due to the bug in `hooks.afterEach()` above!
		assert.ok( true );

		const done = assert.async();

		Promise.resolve().then( function() {

			assert.ok( true );
			throw new Error( "Error thrown in non-returned promise!" );

		} );

		// prevent test from exiting before unhandled rejection fires
		setTimeout( done, 10 );
	} );

} );

