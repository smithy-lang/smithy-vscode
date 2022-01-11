// SYNTAX TEST "source.smithy" "This tests aggregate shapes"
$version: "2.0"

namespace com.example

list List {
// <----    keyword.statement.smithy
//   ^^^^   entity.name.type.smithy
//        ^ punctuation.definition.dictionary.begin.smithy

    member: String
//  ^^^^^^         support.type.property-name.smithy
//        ^        punctuation.separator.dictionary.key-value.smithy
//          ^^^^^^ entity.name.type.smithy

}
// <- punctuation.definition.dictionary.end.smithy

set Set {
// <---   keyword.statement.smithy
//  ^^^   entity.name.type.smithy
//      ^ punctuation.definition.dictionary.begin.smithy

    member: String
//  ^^^^^^         support.type.property-name.smithy
//        ^        punctuation.separator.dictionary.key-value.smithy
//          ^^^^^^ entity.name.type.smithy

}
// <- punctuation.definition.dictionary.end.smithy

map Map {
// <---   keyword.statement.smithy
//  ^^^   entity.name.type.smithy
//      ^ punctuation.definition.dictionary.begin.smithy

    key: String
//  ^^^         support.type.property-name.smithy
//     ^        punctuation.separator.dictionary.key-value.smithy
//       ^^^^^^ entity.name.type.smithy

    value: String
//  ^^^^^         support.type.property-name.smithy
//       ^        punctuation.separator.dictionary.key-value.smithy
//         ^^^^^^ entity.name.type.smithy

}
// <- punctuation.definition.dictionary.end.smithy

structure Structure {
// <---------         keyword.statement.smithy
//        ^^^^^^^^^   entity.name.type.smithy
//                  ^ punctuation.definition.dictionary.begin.smithy

    basic: String
//  ^^^^^         support.type.property-name.smithy
//       ^        punctuation.separator.dictionary.key-value.smithy
//         ^^^^^^ entity.name.type.smithy

}
// <- punctuation.definition.dictionary.end.smithy

union Union {
// <-----     keyword.statement.smithy
//    ^^^^^   entity.name.type.smithy
//          ^ punctuation.definition.dictionary.begin.smithy

    foo: String
//  ^^^         support.type.property-name.smithy
//     ^        punctuation.separator.dictionary.key-value.smithy
//       ^^^^^^ entity.name.type.smithy

}
// <- punctuation.definition.dictionary.end.smithy