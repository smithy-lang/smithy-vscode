// SYNTAX TEST "source.smithy" "This tests statement separators and recovery from half-typed input"
//
// The second half of this file is deliberately invalid Smithy. It pins how far the damage from
// an unclosed construct spreads, so that a later complete statement still highlights.
$version: "2.1" // a trailing comment
// <-                                 keyword.statement.control.smithy
// <~-------                          support.type.property-name.smithy
//      ^                             punctuation.separator.dictionary.pair.smithy
//        ^                           punctuation.definition.string.begin.smithy
//         ^^^                        string.quoted.double.smithy
//            ^                       punctuation.definition.string.end.smithy
//             ^^^^^^^^^^^^^^^^^^^^^^ -invalid.illegal.control.smithy
//              ^^^^^^^^^^^^^^^^^^^^^ comment.line.double-slash.smithy

namespace com.example // a trailing comment
// <---------                               keyword.statement.smithy
//        ^^^^^^^^^^^                       entity.name.type.smithy
//                   ^^^^^^^^^^^^^^^^^^^^^^ -invalid.illegal.namespace.smithy
//                    ^^^^^^^^^^^^^^^^^^^^^ comment.line.double-slash.smithy

use smithy.api#Integer // a trailing comment
// <---                                      keyword.statement.smithy
//  ^^^^^^^^^^^^^^^^^^                       entity.name.type.smithy
//                    ^^^^^^^^^^^^^^^^^^^^^^ -invalid.illegal.use.smithy
//                     ^^^^^^^^^^^^^^^^^^^^^ comment.line.double-slash.smithy

@mixin
structure Mixed {
    inherited: String
}

apply Mixed @sensitive
// <-----              keyword.statement.smithy
//    ^^^^^            entity.name.type.smithy
//         ^^^^^^^^^^^ -invalid.illegal.apply.smithy
//          ^          punctuation.definition.annotation.smithy
//           ^^^^^^^^^ storage.type.annotation.smithy

structure UnclosedList {
    bar: [String
//  ^^^          support.type.property-name.smithy
//     ^         punctuation.separator.dictionary.key-value.smithy
//       ^       meta.structure.inline-list.smithy punctuation.definition.array.begin.smithy
//        ^^^^^^ entity.name.type.smithy
    baz: Integer
}

string AfterUnclosedList
// <------               keyword.statement.smithy
//     ^^^^^^^^^^^^^^^^^ entity.name.type.smithy

structure UnclosedMap {
    bar: {String: String
//  ^^^                  support.type.property-name.smithy
//     ^                 punctuation.separator.dictionary.key-value.smithy
//       ^               meta.structure.inline-map.smithy punctuation.definition.dictionary.begin.smithy
//        ^^^^^^         entity.name.type.smithy
//              ^        punctuation.separator.dictionary.key-value.smithy
//                ^^^^^^ entity.name.type.smithy
    baz: Integer
}

string AfterUnclosedMap
// <------              keyword.statement.smithy
//     ^^^^^^^^^^^^^^^^ entity.name.type.smithy
