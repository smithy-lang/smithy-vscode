// SYNTAX TEST "source.smithy" "This tests aggregate shapes"
$version: "2.0"

namespace com.example

enum Enum {
// <----    keyword.statement.smithy
//   ^^^^   entity.name.type.smithy
//        ^ punctuation.definition.dictionary.begin.smithy

    @enumValue("member")
//  ^                    punctuation.definition.annotation.smithy
//   ^^^^^^^^^           storage.type.annotation.smithy
//            ^          punctuation.definition.dictionary.begin.smithy
//             ^^^^^^^^  string.quoted.double.smithy
//                     ^ punctuation.definition.dictionary.end.smithy

    MEMBER
//  ^^^^^^ entity.name.type.smithy

}
// <- punctuation.definition.dictionary.end.smithy

intEnum IntEnum {
// <-------       keyword.statement.smithy
//      ^^^^^^^   entity.name.type.smithy
//              ^ punctuation.definition.dictionary.begin.smithy

    @enumValue(1)
//  ^             punctuation.definition.annotation.smithy
//   ^^^^^^^^^    storage.type.annotation.smithy
//            ^   punctuation.definition.dictionary.begin.smithy
//             ^  constant.numeric.smithy
//              ^ punctuation.definition.dictionary.end.smithy

    MEMBER
//  ^^^^^^ entity.name.type.smithy

}
// <- punctuation.definition.dictionary.end.smithy
