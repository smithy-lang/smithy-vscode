// SYNTAX TEST "source.smithy" "This tests IDL 2.1 member indexes"
$version: "2.1"

namespace com.example

// An index is digits with no leading zero, then a dot with no space before it, then at
// least one space or tab. It follows any traits and doc comments on the member.
structure Indexed {
    1. first: String
//  ^                constant.numeric.member-index.smithy
//   ^               punctuation.separator.member-index.smithy
//     ^^^^^         support.type.property-name.smithy
//          ^        punctuation.separator.dictionary.key-value.smithy
//            ^^^^^^ entity.name.type.smithy

    10. second: String = "value",
//  ^^                            constant.numeric.member-index.smithy
//    ^                           punctuation.separator.member-index.smithy
//      ^^^^^^                    support.type.property-name.smithy
//            ^                   punctuation.separator.dictionary.key-value.smithy
//              ^^^^^^            entity.name.type.smithy
//                     ^          keyword.operator.smithy
//                       ^        punctuation.definition.string.begin.smithy
//                        ^^^^^   string.quoted.double.smithy
//                             ^  punctuation.definition.string.end.smithy
//                              ^ punctuation.separator.dictionary.pair.smithy

    100.  third: [String]
//  ^^^                   constant.numeric.member-index.smithy
//     ^                  punctuation.separator.member-index.smithy
//        ^^^^^           support.type.property-name.smithy
//             ^          punctuation.separator.dictionary.key-value.smithy
//               ^        meta.structure.inline-list.smithy punctuation.definition.array.begin.smithy
//                ^^^^^^  entity.name.type.smithy
//                      ^ punctuation.definition.array.end.smithy

    2147483647. fourth: {String: [Integer]}
//  ^^^^^^^^^^                              constant.numeric.member-index.smithy
//            ^                             punctuation.separator.member-index.smithy
//              ^^^^^^                      support.type.property-name.smithy
//                    ^                     punctuation.separator.dictionary.key-value.smithy
//                      ^                   meta.structure.inline-map.smithy punctuation.definition.dictionary.begin.smithy
//                       ^^^^^^             entity.name.type.smithy
//                             ^            punctuation.separator.dictionary.key-value.smithy
//                               ^          meta.structure.inline-list.smithy punctuation.definition.array.begin.smithy
//                                ^^^^^^^   entity.name.type.smithy
//                                       ^  punctuation.definition.array.end.smithy
//                                        ^ punctuation.definition.dictionary.end.smithy

    /// A doc comment still precedes the index.
    5. fifth: String
//  ^                constant.numeric.member-index.smithy
//   ^               punctuation.separator.member-index.smithy
//     ^^^^^         support.type.property-name.smithy
//          ^        punctuation.separator.dictionary.key-value.smithy
//            ^^^^^^ entity.name.type.smithy
}

@mixin
structure Common {
    inherited: String
}

structure Elided with [Common] {
    @required
//  ^         punctuation.definition.annotation.smithy
//   ^^^^^^^^ storage.type.annotation.smithy
    1. $inherited
//  ^             constant.numeric.member-index.smithy
//   ^            punctuation.separator.member-index.smithy
//     ^          keyword.statement.elision.smithy
//      ^^^^^^^^^ support.type.property-name.smithy

    2. size: Integer
//  ^                constant.numeric.member-index.smithy
//   ^               punctuation.separator.member-index.smithy
//     ^^^^          support.type.property-name.smithy
//         ^         punctuation.separator.dictionary.key-value.smithy
//           ^^^^^^^ entity.name.type.smithy
}

list Ordered {
    1. member: String
//  ^                 constant.numeric.member-index.smithy
//   ^                punctuation.separator.member-index.smithy
//     ^^^^^^         support.type.property-name.smithy
//           ^        punctuation.separator.dictionary.key-value.smithy
//             ^^^^^^ entity.name.type.smithy
}

operation GetThing {
    input := {
        1. tags: [String]
//      ^                 constant.numeric.member-index.smithy
//       ^                punctuation.separator.member-index.smithy
//         ^^^^           support.type.property-name.smithy
//             ^          punctuation.separator.dictionary.key-value.smithy
//               ^        meta.structure.inline-list.smithy punctuation.definition.array.begin.smithy
//                ^^^^^^  entity.name.type.smithy
//                      ^ punctuation.definition.array.end.smithy
    }
}

// None of these is an index: a decimal keeps its number scope, a dot with no space after
// it is part of an identifier, and zero and leading zeros are not valid index values.
structure NotIndexed {
    threshold: Float = 1.5
//  ^^^^^^^^^              support.type.property-name.smithy
//           ^             punctuation.separator.dictionary.key-value.smithy
//             ^^^^^       entity.name.type.smithy
//                   ^     keyword.operator.smithy
//                     ^^^ -constant.numeric.member-index.smithy
//                     ^^^ constant.numeric.smithy

    1.noSpace: String
//  ^                 constant.numeric.smithy
//  ^^^^^^^^^         -constant.numeric.member-index.smithy
//   ^                meta.keyword.statement.shape.smithy
//    ^^^^^^^         entity.name.type.smithy
//           ^        punctuation.separator.dictionary.key-value.smithy
//             ^^^^^^ entity.name.type.smithy

    0. zero: String
//  ^               constant.numeric.smithy
//  ^^              -constant.numeric.member-index.smithy
//   ^^             meta.keyword.statement.shape.smithy
//     ^^^^         support.type.property-name.smithy
//         ^        punctuation.separator.dictionary.key-value.smithy
//           ^^^^^^ entity.name.type.smithy

    01. leadingZero: String
//  ^^                      constant.numeric.smithy
//  ^^^                     -constant.numeric.member-index.smithy
//    ^^                    meta.keyword.statement.shape.smithy
//      ^^^^^^^^^^^         support.type.property-name.smithy
//                 ^        punctuation.separator.dictionary.key-value.smithy
//                   ^^^^^^ entity.name.type.smithy
}

// A tab may separate the dot from the member name, so the carets below are counted in
// characters and will not line up visually with a rendered tab.
structure TabSeparated {
    7.	seventh: String
//  ^                  constant.numeric.member-index.smithy
//   ^                 punctuation.separator.member-index.smithy
//     ^^^^^^^         support.type.property-name.smithy
//            ^        punctuation.separator.dictionary.key-value.smithy
//              ^^^^^^ entity.name.type.smithy
}

// Enum members have no target, so the index shorthand does not apply there. This is invalid
// Smithy, pinned only to show the number keeps its ordinary numeric scope.
enum NotIndexable {
    1. SPADE
//  ^        constant.numeric.smithy
//  ^^       -constant.numeric.member-index.smithy
//   ^^      meta.keyword.statement.shape.smithy
//     ^^^^^ entity.name.type.smithy
}

// A member at column 0 is not valid Smithy, but it is what a half-typed file looks like and
// it is the only input that reaches the top-level member statement rule.
1. topLevel: [String]
// <-                 constant.numeric.member-index.smithy
// <~-                punctuation.separator.member-index.smithy
// ^^^^^^^^           support.type.property-name.smithy
//         ^          punctuation.separator.dictionary.pair.smithy
//           ^        meta.structure.inline-list.smithy punctuation.definition.array.begin.smithy
//            ^^^^^^  entity.name.type.smithy
//                  ^ punctuation.definition.array.end.smithy
