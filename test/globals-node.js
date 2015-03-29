/*jshint node:true */
(function() {

QUnit.module( "globals for Node.js only" );

QUnit.test( "QUnit exports", function( assert ) {
	var qunit = require( "../dist/qunit" );

	assert.ok( qunit, "Required module QUnit truthy" );
	assert.ok(
		qunit instanceof qunit.constructor,
		"Required module QUnit built from its own constructor"
	);

	assert.strictEqual( qunit, QUnit, "Required module QUnit matches global QUnit" );

	assert.ok( qunit.hasOwnProperty( "QUnit" ), "Required module QUnit has property QUnit" );
	assert.strictEqual(
		qunit.QUnit,
		qunit,
		"Required module QUnit's property QUnit is self-referencing"
	);
});

})();
