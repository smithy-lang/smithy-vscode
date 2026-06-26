// SYNTAX TEST "source.smithy" "This tests the block form of apply"
$version: "2.0"

namespace com.example

string MyShape

apply MyShape {
// <----- keyword.statement.smithy
//    ^^^^^^^ entity.name.type.smithy
//            ^ punctuation.definition.dictionary.begin.smithy
    @deprecated
//   ^^^^^^^^^^ storage.type.annotation.smithy
    @tags(["legacy"])
//   ^^^^ storage.type.annotation.smithy
//        ^ punctuation.definition.array.begin.smithy
//         ^^^^^^^^ string.quoted.double.smithy
//                 ^ punctuation.definition.array.end.smithy
}
// <- punctuation.definition.dictionary.end.smithy
