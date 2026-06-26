// SYNTAX TEST "source.smithy" "This tests escaped quotes inside string values"
$version: "2.0"

namespace com.example

// A string value containing escaped quotes (e.g. an embedded JSON document) must
// not be mistaken for an object key. Regression test: the closing quote of such a
// value used to be read as the start of a new string, corrupting following lines.
@httpRequestTests([
    {
        body: "{\"value\":5}"
//      ^^^^ support.type.property-name.smithy
//            ^ punctuation.definition.string.begin.smithy
//             ^ string.quoted.double.smithy
//              ^^ constant.character.escape.smithy
//                          ^ punctuation.definition.string.end.smithy

        headers: { "Content-Type": "application/json" }
//      ^^^^^^^ support.type.property-name.smithy
//                 ^^^^^^^^^^^^^^ support.type.property-name.smithy
//                                 ^^^^^^^^^^^^^^^^ string.quoted.double.smithy
    }
])
operation GetFoo {}
