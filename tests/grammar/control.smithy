// SYNTAX TEST "source.smithy" "This tests control statments"

$version: "2.0"
// <-           keyword.statement.control.smithy
// <~-------    support.type.property-name.smithy
//      ^       punctuation.separator.dictionary.pair.smithy
//        ^     punctuation.definition.string.begin.smithy
//         ^^^  string.quoted.double.smithy
//            ^ punctuation.definition.string.end.smithy

$version: "2.1"
// <-           keyword.statement.control.smithy
// <~-------    support.type.property-name.smithy
//      ^       punctuation.separator.dictionary.pair.smithy
//        ^     punctuation.definition.string.begin.smithy
//         ^^^  string.quoted.double.smithy
//            ^ punctuation.definition.string.end.smithy

// The key may be quoted, and a space may precede the colon.
$"version": "2.1"
// <-             keyword.statement.control.smithy
// <~---------    support.type.property-name.smithy
//        ^       punctuation.separator.dictionary.pair.smithy
//          ^     punctuation.definition.string.begin.smithy
//           ^^^  string.quoted.double.smithy
//              ^ punctuation.definition.string.end.smithy

$operationInputSuffix : "Request"
// <-                             keyword.statement.control.smithy
// <~--------------------         support.type.property-name.smithy
//                    ^           punctuation.separator.dictionary.pair.smithy
//                      ^         punctuation.definition.string.begin.smithy
//                       ^^^^^^^  string.quoted.double.smithy
//                              ^ punctuation.definition.string.end.smithy
