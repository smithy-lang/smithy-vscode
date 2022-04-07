// SYNTAX TEST "source.smithy" "This tests traits"
$version: "2.0"

namespace com.example

@foo
// <-    punctuation.definition.annotation.smithy
// <~--- storage.type.annotation.smithy

@bar()
// <-    punctuation.definition.annotation.smithy
// <~--- storage.type.annotation.smithy
//  ^    punctuation.definition.dictionary.begin.smithy
//   ^   punctuation.definition.dictionary.end.smithy

@baz(400)
// <-     punctuation.definition.annotation.smithy
// <~---  storage.type.annotation.smithy
//  ^     punctuation.definition.dictionary.begin.smithy
//   ^^^  constant.numeric.smithy
//      ^ punctuation.definition.dictionary.end.smithy

string Foo

apply Foo @mixin
// <-----        keyword.statement.smithy
//    ^^^        entity.name.type.smithy
//        ^      punctuation.definition.annotation.smithy
//         ^^^^^ storage.type.annotation.smithy