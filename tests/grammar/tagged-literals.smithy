// SYNTAX TEST "source.smithy" "This tests IDL 2.1 tagged string literals"
$version: "2.1"

namespace com.example

// A tag is only a tag when it is one of re, b, hex or timestamp and a quote follows it,
// which is what keeps the `#` of a shape id from starting a literal.
use com.other#b
// <---         keyword.statement.smithy
//  ^^^^^^^^^^^ entity.name.type.smithy

@pattern(#re "^\d{3}-\d{2}-\d{4}$")
// <-                               punctuation.definition.annotation.smithy
// <~-------                        storage.type.annotation.smithy
//      ^                           punctuation.definition.dictionary.begin.smithy
//       ^                          punctuation.definition.tag.smithy
//        ^^                        storage.type.tag.smithy
//           ^                      punctuation.definition.string.begin.smithy
//            ^^^^^^^^^^^^^^^^^^^   string.quoted.double.raw.smithy
//             ^^                   -constant.character.escape.smithy
//                               ^  punctuation.definition.string.end.smithy
//                                ^ punctuation.definition.dictionary.end.smithy
string Ssn

@pattern(#re "a\"b")
// <-                punctuation.definition.annotation.smithy
// <~-------         storage.type.annotation.smithy
//      ^            punctuation.definition.dictionary.begin.smithy
//       ^           punctuation.definition.tag.smithy
//        ^^         storage.type.tag.smithy
//           ^       punctuation.definition.string.begin.smithy
//            ^      string.quoted.double.raw.smithy
//             ^^    constant.character.escape.smithy
//               ^   string.quoted.double.raw.smithy
//                ^  punctuation.definition.string.end.smithy
//                 ^ punctuation.definition.dictionary.end.smithy
string QuoteInRegex

@pattern(#re "trailing\\")
// <-                      punctuation.definition.annotation.smithy
// <~-------               storage.type.annotation.smithy
//      ^                  punctuation.definition.dictionary.begin.smithy
//       ^                 punctuation.definition.tag.smithy
//        ^^               storage.type.tag.smithy
//           ^             punctuation.definition.string.begin.smithy
//            ^^^^^^^^^^   string.quoted.double.raw.smithy
//                      ^  punctuation.definition.string.end.smithy
//                       ^ punctuation.definition.dictionary.end.smithy
string TrailingBackslash

structure Literals {
    avatar: Blob = #b "\x89PNG\x0D\x0A"
//  ^^^^^^                              support.type.property-name.smithy
//        ^                             punctuation.separator.dictionary.key-value.smithy
//          ^^^^                        entity.name.type.smithy
//               ^                      keyword.operator.smithy
//                 ^                    punctuation.definition.tag.smithy
//                  ^                   storage.type.tag.smithy
//                    ^                 punctuation.definition.string.begin.smithy
//                     ^^^^^^^^^^^^^^^  string.quoted.double.raw.smithy
//                                    ^ punctuation.definition.string.end.smithy

    created: Timestamp = #timestamp "2024-01-01T00:00:00Z"
//  ^^^^^^^                                                support.type.property-name.smithy
//         ^                                               punctuation.separator.dictionary.key-value.smithy
//           ^^^^^^^^^                                     entity.name.type.smithy
//                     ^                                   keyword.operator.smithy
//                       ^                                 punctuation.definition.tag.smithy
//                        ^^^^^^^^^                        storage.type.tag.smithy
//                                  ^                      punctuation.definition.string.begin.smithy
//                                   ^^^^^^^^^^^^^^^^^^^^  string.quoted.double.raw.smithy
//                                                       ^ punctuation.definition.string.end.smithy

    digest: Blob = #hex "de ad # a hex comment"
//  ^^^^^^                                      support.type.property-name.smithy
//        ^                                     punctuation.separator.dictionary.key-value.smithy
//          ^^^^                                entity.name.type.smithy
//               ^                              keyword.operator.smithy
//                 ^                            punctuation.definition.tag.smithy
//                  ^^^                         storage.type.tag.smithy
//                      ^                       punctuation.definition.string.begin.smithy
//                       ^^^^^^^^^^^^^^^^^^^^^  string.quoted.double.raw.smithy
//                                            ^ punctuation.definition.string.end.smithy

    empty: String = #re ""
//  ^^^^^                  support.type.property-name.smithy
//       ^                 punctuation.separator.dictionary.key-value.smithy
//         ^^^^^^          entity.name.type.smithy
//                ^        keyword.operator.smithy
//                  ^      punctuation.definition.tag.smithy
//                   ^^    storage.type.tag.smithy
//                      ^  punctuation.definition.string.begin.smithy
//                       ^ punctuation.definition.string.end.smithy

    tight: String = #re"[a-z]+"
//  ^^^^^                       support.type.property-name.smithy
//       ^                      punctuation.separator.dictionary.key-value.smithy
//         ^^^^^^               entity.name.type.smithy
//                ^             keyword.operator.smithy
//                  ^           punctuation.definition.tag.smithy
//                   ^^         storage.type.tag.smithy
//                     ^        punctuation.definition.string.begin.smithy
//                      ^^^^^^  string.quoted.double.raw.smithy
//                            ^ punctuation.definition.string.end.smithy
}

@documentation(#re """
// <-                  punctuation.definition.annotation.smithy
// <~-------------     storage.type.annotation.smithy
//            ^        punctuation.definition.dictionary.begin.smithy
//             ^       punctuation.definition.tag.smithy
//              ^^     storage.type.tag.smithy
//                 ^^^ punctuation.definition.string.begin.smithy
    a multi-line raw
// <--------------------- string.quoted.double.raw.smithy
    pattern
    """)
//  ^^^  punctuation.definition.string.end.smithy
//     ^ punctuation.definition.dictionary.end.smithy
string Documented

metadata validators = [{name: #re "^.*$"}]
// <--------                               keyword.statement.smithy
//       ^^^^^^^^^^                        variable.other.smithy
//                  ^                      keyword.operator.smithy
//                    ^                    meta.structure.array.smithy punctuation.definition.array.begin.smithy
//                     ^                   meta.structure.dictionary.smithy punctuation.definition.dictionary.begin.smithy
//                      ^^^^               support.type.property-name.smithy
//                          ^              punctuation.separator.dictionary.key-value.smithy
//                            ^            punctuation.definition.tag.smithy
//                             ^^          storage.type.tag.smithy
//                                ^        punctuation.definition.string.begin.smithy
//                                 ^^^^    string.quoted.double.raw.smithy
//                                     ^   punctuation.definition.string.end.smithy
//                                      ^  punctuation.definition.dictionary.end.smithy
//                                       ^ punctuation.definition.array.end.smithy

enum Suit {
    SPADE = #re "spade"
//  ^^^^^               entity.name.type.smithy
//        ^             keyword.operator.smithy
//          ^           punctuation.definition.tag.smithy
//           ^^         storage.type.tag.smithy
//              ^       punctuation.definition.string.begin.smithy
//               ^^^^^  string.quoted.double.raw.smithy
//                    ^ punctuation.definition.string.end.smithy
}

@smithy.protocols#idx(20)
// <-                     punctuation.definition.annotation.smithy
// <~-------------------- storage.type.annotation.smithy
//               ^^^^     -storage.type.tag.smithy
//                   ^    punctuation.definition.dictionary.begin.smithy
//                    ^^  constant.numeric.smithy
//                      ^ punctuation.definition.dictionary.end.smithy
integer NotATag

// None of these is a tagged literal, so each falls back to an ordinary quoted string.
structure NotTagged {
    re: com.example#re
//  ^^                 support.type.property-name.smithy
//    ^                punctuation.separator.dictionary.key-value.smithy
//      ^^^^^^^^^^^^^^ entity.name.type.smithy
//                 ^^^ -storage.type.tag.smithy

    upper: String = #RE "plain string"
//  ^^^^^                              support.type.property-name.smithy
//       ^                             punctuation.separator.dictionary.key-value.smithy
//         ^^^^^^                      entity.name.type.smithy
//                ^                    keyword.operator.smithy
//                  ^^^                -storage.type.tag.smithy
//                   ^^                entity.name.type.smithy
//                      ^              punctuation.definition.string.begin.smithy
//                       ^^^^^^^^^^^^  string.quoted.double.smithy
//                                   ^ punctuation.definition.string.end.smithy

    unknown: String = #bytes "plain string"
//  ^^^^^^^                                 support.type.property-name.smithy
//         ^                                punctuation.separator.dictionary.key-value.smithy
//           ^^^^^^                         entity.name.type.smithy
//                  ^                       keyword.operator.smithy
//                    ^^^^^^                -storage.type.tag.smithy
//                     ^^^^^                entity.name.type.smithy
//                           ^              punctuation.definition.string.begin.smithy
//                            ^^^^^^^^^^^^  string.quoted.double.smithy
//                                        ^ punctuation.definition.string.end.smithy

    spaced: String = # re "plain string"
//  ^^^^^^                               support.type.property-name.smithy
//        ^                              punctuation.separator.dictionary.key-value.smithy
//          ^^^^^^                       entity.name.type.smithy
//                 ^                     keyword.operator.smithy
//                     ^^                entity.name.type.smithy
//                        ^              punctuation.definition.string.begin.smithy
//                         ^^^^^^^^^^^^  string.quoted.double.smithy
//                                     ^ punctuation.definition.string.end.smithy
}
