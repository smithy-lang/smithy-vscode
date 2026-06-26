// SYNTAX TEST "source.smithy" "This tests node value literals in trait arguments"
$version: "2.0"

namespace com.example

@trait
document aTrait

@aTrait([
    "a string",
//  ^^^^^^^^^^ string.quoted.double.smithy
    true,
//  ^^^^ constant.language.smithy
    false,
//  ^^^^^ constant.language.smithy
    null,
//  ^^^^ constant.language.smithy
    1,
//  ^ constant.numeric.smithy
    -2,
//  ^^ constant.numeric.smithy
    3.14,
//  ^^^^ constant.numeric.smithy
    -0.5e10,
//  ^^^^^^^ constant.numeric.smithy
    6.0E-23
//  ^^^^^^^ constant.numeric.smithy
])
string Scalars

@aTrait({
//      ^ punctuation.definition.dictionary.begin.smithy
    key: "value",
//  ^^^ support.type.property-name.smithy
//     ^ punctuation.separator.dictionary.key-value.smithy
//       ^^^^^^^ string.quoted.double.smithy
    nested: [1, 2]
//  ^^^^^^ support.type.property-name.smithy
//          ^ punctuation.definition.array.begin.smithy
//           ^ constant.numeric.smithy
//              ^ constant.numeric.smithy
//               ^ punctuation.definition.array.end.smithy
})
string Structured
