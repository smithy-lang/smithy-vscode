// SYNTAX TEST "source.smithy" "This tests trait values, including keyed arguments without braces"
$version: "2.1"

namespace com.example

// The common trait form is keyed arguments with no surrounding braces.
@http(method: "GET", uri: "/things", code: 200)
// <-                                           punctuation.definition.annotation.smithy
// <~----                                       storage.type.annotation.smithy
//   ^                                          punctuation.definition.dictionary.begin.smithy
//    ^^^^^^                                    support.type.property-name.smithy
//          ^                                   punctuation.separator.dictionary.key-value.smithy
//            ^                                 punctuation.definition.string.begin.smithy
//             ^^^                              string.quoted.double.smithy
//                ^                             punctuation.definition.string.end.smithy
//                 ^                            punctuation.separator.dictionary.pair.smithy
//                   ^^^                        support.type.property-name.smithy
//                      ^                       punctuation.separator.dictionary.key-value.smithy
//                        ^                     punctuation.definition.string.begin.smithy
//                         ^^^^^^^              string.quoted.double.smithy
//                                ^             punctuation.definition.string.end.smithy
//                                 ^            punctuation.separator.dictionary.pair.smithy
//                                   ^^^^       support.type.property-name.smithy
//                                       ^      punctuation.separator.dictionary.key-value.smithy
//                                         ^^^  constant.numeric.smithy
//                                            ^ punctuation.definition.dictionary.end.smithy
operation GetThings {
    output: Unit
}

@trait(selector: "structure")
// <-                         punctuation.definition.annotation.smithy
// <~-----                    storage.type.annotation.smithy
//    ^                       punctuation.definition.dictionary.begin.smithy
//     ^^^^^^^^               support.type.property-name.smithy
//             ^              punctuation.separator.dictionary.key-value.smithy
//               ^            punctuation.definition.string.begin.smithy
//                ^^^^^^^^^   string.quoted.double.smithy
//                         ^  punctuation.definition.string.end.smithy
//                          ^ punctuation.definition.dictionary.end.smithy
@length(min: 1, max: 10)
// <-                    punctuation.definition.annotation.smithy
// <~------              storage.type.annotation.smithy
//     ^                 punctuation.definition.dictionary.begin.smithy
//      ^^^              support.type.property-name.smithy
//         ^             punctuation.separator.dictionary.key-value.smithy
//           ^           constant.numeric.smithy
//            ^          punctuation.separator.dictionary.pair.smithy
//              ^^^      support.type.property-name.smithy
//                 ^     punctuation.separator.dictionary.key-value.smithy
//                   ^^  constant.numeric.smithy
//                     ^ punctuation.definition.dictionary.end.smithy
structure Keyed {
    member: String
}

@references([{resource: Sprocket, ids: {id: "memberId"}}])
// <-                                                      punctuation.definition.annotation.smithy
// <~----------                                            storage.type.annotation.smithy
//         ^                                               punctuation.definition.dictionary.begin.smithy
//          ^                                              meta.structure.array.smithy punctuation.definition.array.begin.smithy
//           ^                                             meta.structure.dictionary.smithy punctuation.definition.dictionary.begin.smithy
//            ^^^^^^^^                                     support.type.property-name.smithy
//                    ^                                    punctuation.separator.dictionary.key-value.smithy
//                      ^^^^^^^^                           entity.name.type.smithy
//                              ^                          punctuation.separator.dictionary.pair.smithy
//                                ^^^                      support.type.property-name.smithy
//                                   ^                     punctuation.separator.dictionary.key-value.smithy
//                                     ^                   meta.structure.dictionary.smithy punctuation.definition.dictionary.begin.smithy
//                                      ^^                 support.type.property-name.smithy
//                                        ^                punctuation.separator.dictionary.key-value.smithy
//                                          ^              punctuation.definition.string.begin.smithy
//                                           ^^^^^^^^      string.quoted.double.smithy
//                                                   ^     punctuation.definition.string.end.smithy
//                                                    ^^   punctuation.definition.dictionary.end.smithy
//                                                      ^  punctuation.definition.array.end.smithy
//                                                       ^ punctuation.definition.dictionary.end.smithy
structure Nested {
    memberId: String
}

@deprecated
// <-           punctuation.definition.annotation.smithy
// <~---------- storage.type.annotation.smithy
@sensitive
structure Annotations {
    member: String
}

resource Sprocket {
// <--------        keyword.statement.smithy
//       ^^^^^^^^   entity.name.type.smithy
//                ^ punctuation.definition.dictionary.begin.smithy
    identifiers: { id: String }
//  ^^^^^^^^^^^                 support.type.property-name.smithy
//             ^                punctuation.separator.dictionary.key-value.smithy
//               ^              meta.structure.dictionary.smithy punctuation.definition.dictionary.begin.smithy
//                 ^^           support.type.property-name.smithy
//                   ^          punctuation.separator.dictionary.key-value.smithy
//                     ^^^^^^   entity.name.type.smithy
//                            ^ punctuation.definition.dictionary.end.smithy
}
