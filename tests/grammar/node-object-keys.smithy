// SYNTAX TEST "source.smithy" "This tests node object keys"
//
// An unquoted key must be an identifier, so the last two keys are deliberately invalid.
$version: "2.1"

namespace com.example

structure Keys {
    plain: Document = {bare: 1, "quoted key": 2, dotted.key: 3, "a.b#c": 4}
//  ^^^^^                                                                   support.type.property-name.smithy
//       ^                                                                  punctuation.separator.dictionary.key-value.smithy
//         ^^^^^^^^                                                         entity.name.type.smithy
//                  ^                                                       keyword.operator.smithy
//                    ^                                                     meta.structure.dictionary.smithy punctuation.definition.dictionary.begin.smithy
//                     ^^^^                                                 support.type.property-name.smithy
//                         ^                                                punctuation.separator.dictionary.key-value.smithy
//                           ^                                              constant.numeric.smithy
//                            ^                                             punctuation.separator.dictionary.pair.smithy
//                              ^^^^^^^^^^^^                                support.type.property-name.smithy
//                                          ^                               punctuation.separator.dictionary.key-value.smithy
//                                            ^                             constant.numeric.smithy
//                                             ^                            punctuation.separator.dictionary.pair.smithy
//                                               ^^^^^^^^^^                 support.type.property-name.smithy
//                                                         ^                punctuation.separator.dictionary.key-value.smithy
//                                                           ^              constant.numeric.smithy
//                                                            ^             punctuation.separator.dictionary.pair.smithy
//                                                              ^^^^^^^     support.type.property-name.smithy
//                                                                     ^    punctuation.separator.dictionary.key-value.smithy
//                                                                       ^  constant.numeric.smithy
//                                                                        ^ punctuation.definition.dictionary.end.smithy

    illegal: Document = {3bad: 5, .lead: 6}
//  ^^^^^^^                                 support.type.property-name.smithy
//         ^                                punctuation.separator.dictionary.key-value.smithy
//           ^^^^^^^^                       entity.name.type.smithy
//                    ^                     keyword.operator.smithy
//                      ^                   meta.structure.dictionary.smithy punctuation.definition.dictionary.begin.smithy
//                       ^                  constant.numeric.smithy
//                       ^^^^               -support.type.property-name.smithy
//                        ^^^               entity.name.type.smithy
//                           ^              punctuation.separator.dictionary.key-value.smithy
//                             ^            constant.numeric.smithy
//                              ^           punctuation.separator.dictionary.pair.smithy
//                               ^^         meta.structure.dictionary.smithy
//                                ^^^^^     -support.type.property-name.smithy
//                                 ^^^^     entity.name.type.smithy
//                                     ^    punctuation.separator.dictionary.key-value.smithy
//                                       ^  constant.numeric.smithy
//                                        ^ punctuation.definition.dictionary.end.smithy
}
