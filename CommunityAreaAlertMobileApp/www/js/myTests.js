QUnit.test('compareStringsEqual()', function(assert) {
    assert.equal(compareStrings("test", "test"), 0, "Both are equal.");
});

QUnit.test('compareStringsNotEqual()', function(assert) {
    assert.equal(compareStrings("test1", "test"), 1, "Both are not equal.");
});

QUnit.test('getUrlValue()', function(assert) {
    assert.equal(getUrlValue("value=correctValue"), "correctValue", "Correct Value was returned.");
});

QUnit.test('isUsernameLengthCorrectTrue()', function(assert) {
    assert.equal(isUsernameLengthCorrect("true"), true, "Username is correct length.");
});

QUnit.test('isUsernameLengthCorrectFalse()', function(assert) {
    assert.equal(isUsernameLengthCorrect("1234567891234567"), false, "Username is too short.");
});

QUnit.test('isUsernameLengthCorrectFalse()', function(assert) {
    assert.equal(isUsernameLengthCorrect("123"), false, "Username is too long.");
});

QUnit.test('isEmptyFalse()', function(assert) {
    assert.equal(isEmpty("notEmpty"), false, "String is not empty.");
});

QUnit.test('isEmptyTrue()', function(assert) {
    assert.equal(isEmpty(""), true, "String is empty.");
});

QUnit.test('isPasswordLengthCorrectTrue()', function(assert) {
    assert.equal(isPasswordLengthCorrect("password"), true, "Password is correct length.");
});

QUnit.test('isPasswordLengthCorrectFalse()', function(assert) {
    assert.equal(isPasswordLengthCorrect("1234567891234567"), false, "Password is too long.");
});

QUnit.test('isPasswordLengthCorrectFalse()', function(assert) {
    assert.equal(isPasswordLengthCorrect("123"), false, "Password is too short.");
});





