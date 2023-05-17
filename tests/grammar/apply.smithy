// SYNTAX TEST "source.smithy" "This tests apply statements"
$version: "2.0"

namespace com.example

string Foo

apply Foo @mixin
// <-----        keyword.statement.smithy
//    ^^^        entity.name.type.smithy
//        ^      punctuation.definition.annotation.smithy
//         ^^^^^ storage.type.annotation.smithy

apply com.example#Foo @mixin
// <-----                       keyword.statement.smithy
//    ^^^^^^^^^^^^^^^           entity.name.type.smithy
//                    ^         punctuation.definition.annotation.smithy
//                     ^^^^^    storage.type.annotation.smithy
