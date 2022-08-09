// SYNTAX TEST "source.smithy" "This tests enum and intEnum shapes"
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

enum EnumWithEnumValueTraitSugar {
// <----                           keyword.statement.smithy
//   ^^^^^^^^^^^^^^^^^^^^^^^^^^^   entity.name.type.smithy
//                               ^ punctuation.definition.dictionary.begin.smithy

    MEMBER = "member"
//  ^^^^^^ entity.name.type.smithy
//         ^ keyword.operator.smithy
//           ^^^^^^^^ string.quoted.double.smithy

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

intEnum IntEnumWithEnumValueTraitSugar {
// <-------                              keyword.statement.smithy
//      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^   entity.name.type.smithy
//                                     ^ punctuation.definition.dictionary.begin.smithy

    MEMBER = 1
//  ^^^^^^     entity.name.type.smithy
//         ^   keyword.operator.smithy
//           ^ constant.numeric.smithy

}
// <- punctuation.definition.dictionary.end.smithy
