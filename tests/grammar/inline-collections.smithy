// SYNTAX TEST "source.smithy" "This tests IDL 2.1 inline collection declarations"
$version: "2.1"

namespace com.example

// An inline collection stands where a member target goes, so its contents are shape
// references rather than node values. Whitespace inside the delimiters is optional, and
// commas, comments and newlines all count as whitespace there.
structure InlineTargets {
    tags: [String]
//  ^^^^           support.type.property-name.smithy
//      ^          punctuation.separator.dictionary.key-value.smithy
//        ^        meta.structure.inline-list.smithy punctuation.definition.array.begin.smithy
//         ^^^^^^  entity.name.type.smithy
//               ^ punctuation.definition.array.end.smithy

    attributes: {String: Integer}
//  ^^^^^^^^^^                    support.type.property-name.smithy
//            ^                   punctuation.separator.dictionary.key-value.smithy
//              ^                 meta.structure.inline-map.smithy punctuation.definition.dictionary.begin.smithy
//               ^^^^^^           entity.name.type.smithy
//                     ^          punctuation.separator.dictionary.key-value.smithy
//                       ^^^^^^^  entity.name.type.smithy
//                              ^ punctuation.definition.dictionary.end.smithy

    nested: {String: [Integer]}
//  ^^^^^^                      support.type.property-name.smithy
//        ^                     punctuation.separator.dictionary.key-value.smithy
//          ^                   meta.structure.inline-map.smithy punctuation.definition.dictionary.begin.smithy
//           ^^^^^^             entity.name.type.smithy
//                 ^            punctuation.separator.dictionary.key-value.smithy
//                   ^          meta.structure.inline-list.smithy punctuation.definition.array.begin.smithy
//                    ^^^^^^^   entity.name.type.smithy
//                           ^  punctuation.definition.array.end.smithy
//                            ^ punctuation.definition.dictionary.end.smithy

    deep: [[[String]]]
//  ^^^^               support.type.property-name.smithy
//      ^              punctuation.separator.dictionary.key-value.smithy
//        ^^^          meta.structure.inline-list.smithy punctuation.definition.array.begin.smithy
//           ^^^^^^    entity.name.type.smithy
//                 ^^^ punctuation.definition.array.end.smithy

    mapInList: [{String: Integer}]
//  ^^^^^^^^^                      support.type.property-name.smithy
//           ^                     punctuation.separator.dictionary.key-value.smithy
//             ^                   meta.structure.inline-list.smithy punctuation.definition.array.begin.smithy
//              ^                  meta.structure.inline-map.smithy punctuation.definition.dictionary.begin.smithy
//               ^^^^^^            entity.name.type.smithy
//                     ^           punctuation.separator.dictionary.key-value.smithy
//                       ^^^^^^^   entity.name.type.smithy
//                              ^  punctuation.definition.dictionary.end.smithy
//                               ^ punctuation.definition.array.end.smithy

    mapInMap: {String: {String: Integer}}
//  ^^^^^^^^                              support.type.property-name.smithy
//          ^                             punctuation.separator.dictionary.key-value.smithy
//            ^                           meta.structure.inline-map.smithy punctuation.definition.dictionary.begin.smithy
//             ^^^^^^                     entity.name.type.smithy
//                   ^                    punctuation.separator.dictionary.key-value.smithy
//                     ^                  meta.structure.inline-map.smithy punctuation.definition.dictionary.begin.smithy
//                      ^^^^^^            entity.name.type.smithy
//                            ^           punctuation.separator.dictionary.key-value.smithy
//                              ^^^^^^^   entity.name.type.smithy
//                                     ^^ punctuation.definition.dictionary.end.smithy

    qualified: [com.example#InlineTargets]
//  ^^^^^^^^^                              support.type.property-name.smithy
//           ^                             punctuation.separator.dictionary.key-value.smithy
//             ^                           meta.structure.inline-list.smithy punctuation.definition.array.begin.smithy
//              ^^^^^^^^^^^^^^^^^^^^^^^^^  entity.name.type.smithy
//                                       ^ punctuation.definition.array.end.smithy

    tight:{String:[Integer]}
//  ^^^^^                    support.type.property-name.smithy
//       ^                   punctuation.separator.dictionary.key-value.smithy
//        ^                  meta.structure.inline-map.smithy punctuation.definition.dictionary.begin.smithy
//         ^^^^^^            entity.name.type.smithy
//               ^           punctuation.separator.dictionary.key-value.smithy
//                ^          meta.structure.inline-list.smithy punctuation.definition.array.begin.smithy
//                 ^^^^^^^   entity.name.type.smithy
//                        ^  punctuation.definition.array.end.smithy
//                         ^ punctuation.definition.dictionary.end.smithy

    trailing: [String] // a trailing comment
//  ^^^^^^^^                                 support.type.property-name.smithy
//          ^                                punctuation.separator.dictionary.key-value.smithy
//            ^                              meta.structure.inline-list.smithy punctuation.definition.array.begin.smithy
//             ^^^^^^                        entity.name.type.smithy
//                   ^                       punctuation.definition.array.end.smithy
//                     ^^^^^^^^^^^^^^^^^^^^^ comment.line.double-slash.smithy

    assigned: [String] = []
//  ^^^^^^^^                support.type.property-name.smithy
//          ^               punctuation.separator.dictionary.key-value.smithy
//            ^             meta.structure.inline-list.smithy punctuation.definition.array.begin.smithy
//             ^^^^^^       entity.name.type.smithy
//                   ^      punctuation.definition.array.end.smithy
//                     ^    keyword.operator.smithy
//                       ^  meta.structure.array.smithy punctuation.definition.array.begin.smithy
//                        ^ punctuation.definition.array.end.smithy

    spread: [
        // commas and comments are whitespace inside the brackets
        String,
//      ^^^^^^  entity.name.type.smithy
//            ^ punctuation.separator.array.smithy
    ]
//  ^ punctuation.definition.array.end.smithy

    commas: {String , : , Integer ,}
//  ^^^^^^                           support.type.property-name.smithy
//        ^                          punctuation.separator.dictionary.key-value.smithy
//          ^                        meta.structure.inline-map.smithy punctuation.definition.dictionary.begin.smithy
//           ^^^^^^                  entity.name.type.smithy
//                  ^                punctuation.separator.dictionary.pair.smithy
//                    ^              punctuation.separator.dictionary.key-value.smithy
//                      ^            punctuation.separator.dictionary.pair.smithy
//                        ^^^^^^^    entity.name.type.smithy
//                                ^  punctuation.separator.dictionary.pair.smithy
//                                 ^ punctuation.definition.dictionary.end.smithy

    multiline: {
        String: [Integer]
//      ^^^^^^            entity.name.type.smithy
//            ^           punctuation.separator.dictionary.key-value.smithy
//              ^         meta.structure.inline-list.smithy punctuation.definition.array.begin.smithy
//               ^^^^^^^  entity.name.type.smithy
//                      ^ punctuation.definition.array.end.smithy
    }

    bad: [String!]
//  ^^^            support.type.property-name.smithy
//     ^           punctuation.separator.dictionary.key-value.smithy
//       ^         meta.structure.inline-list.smithy punctuation.definition.array.begin.smithy
//        ^^^^^^   entity.name.type.smithy
//              ^  invalid.illegal.inline-list.smithy
//               ^ punctuation.definition.array.end.smithy
}

// These names are also service and resource properties. Inside a member body they are
// ordinary members, so their targets are shape references, not property names.
structure SharedNames {
    identifiers: {String: Integer}
//  ^^^^^^^^^^^                    support.type.property-name.smithy
//             ^                   punctuation.separator.dictionary.key-value.smithy
//               ^                 meta.structure.inline-map.smithy punctuation.definition.dictionary.begin.smithy
//                ^^^^^^           entity.name.type.smithy
//                      ^          punctuation.separator.dictionary.key-value.smithy
//                        ^^^^^^^  entity.name.type.smithy
//                               ^ punctuation.definition.dictionary.end.smithy

    properties: {String: String}
//  ^^^^^^^^^^                   support.type.property-name.smithy
//            ^                  punctuation.separator.dictionary.key-value.smithy
//              ^                meta.structure.inline-map.smithy punctuation.definition.dictionary.begin.smithy
//               ^^^^^^          entity.name.type.smithy
//                     ^         punctuation.separator.dictionary.key-value.smithy
//                       ^^^^^^  entity.name.type.smithy
//                             ^ punctuation.definition.dictionary.end.smithy

    rename: {String: String}
//  ^^^^^^                   support.type.property-name.smithy
//        ^                  punctuation.separator.dictionary.key-value.smithy
//          ^                meta.structure.inline-map.smithy punctuation.definition.dictionary.begin.smithy
//           ^^^^^^          entity.name.type.smithy
//                 ^         punctuation.separator.dictionary.key-value.smithy
//                   ^^^^^^  entity.name.type.smithy
//                         ^ punctuation.definition.dictionary.end.smithy

    errors: [String]
//  ^^^^^^           support.type.property-name.smithy
//        ^          punctuation.separator.dictionary.key-value.smithy
//          ^        meta.structure.inline-list.smithy punctuation.definition.array.begin.smithy
//           ^^^^^^  entity.name.type.smithy
//                 ^ punctuation.definition.array.end.smithy

    operations: [String]
//  ^^^^^^^^^^           support.type.property-name.smithy
//            ^          punctuation.separator.dictionary.key-value.smithy
//              ^        meta.structure.inline-list.smithy punctuation.definition.array.begin.smithy
//               ^^^^^^  entity.name.type.smithy
//                     ^ punctuation.definition.array.end.smithy

    collectionOperations: [String]
//  ^^^^^^^^^^^^^^^^^^^^           support.type.property-name.smithy
//                      ^          punctuation.separator.dictionary.key-value.smithy
//                        ^        meta.structure.inline-list.smithy punctuation.definition.array.begin.smithy
//                         ^^^^^^  entity.name.type.smithy
//                               ^ punctuation.definition.array.end.smithy

    resources: [String]
//  ^^^^^^^^^           support.type.property-name.smithy
//           ^          punctuation.separator.dictionary.key-value.smithy
//             ^        meta.structure.inline-list.smithy punctuation.definition.array.begin.smithy
//              ^^^^^^  entity.name.type.smithy
//                    ^ punctuation.definition.array.end.smithy
}

union Choice {
    names: [String]
//  ^^^^^           support.type.property-name.smithy
//       ^          punctuation.separator.dictionary.key-value.smithy
//         ^        meta.structure.inline-list.smithy punctuation.definition.array.begin.smithy
//          ^^^^^^  entity.name.type.smithy
//                ^ punctuation.definition.array.end.smithy
}

list Nested {
    member: [String]
//  ^^^^^^           support.type.property-name.smithy
//        ^          punctuation.separator.dictionary.key-value.smithy
//          ^        meta.structure.inline-list.smithy punctuation.definition.array.begin.smithy
//           ^^^^^^  entity.name.type.smithy
//                 ^ punctuation.definition.array.end.smithy
}

map Values {
    key: String

    value: {String: String}
//  ^^^^^                   support.type.property-name.smithy
//       ^                  punctuation.separator.dictionary.key-value.smithy
//         ^                meta.structure.inline-map.smithy punctuation.definition.dictionary.begin.smithy
//          ^^^^^^          entity.name.type.smithy
//                ^         punctuation.separator.dictionary.key-value.smithy
//                  ^^^^^^  entity.name.type.smithy
//                        ^ punctuation.definition.dictionary.end.smithy
}

// An inline operation input or output holds real members, so inline targets apply there too.
operation GetThing {
    input := {
        attrs: {String: Integer}
//      ^^^^^                    support.type.property-name.smithy
//           ^                   punctuation.separator.dictionary.key-value.smithy
//             ^                 meta.structure.inline-map.smithy punctuation.definition.dictionary.begin.smithy
//              ^^^^^^           entity.name.type.smithy
//                    ^          punctuation.separator.dictionary.key-value.smithy
//                      ^^^^^^^  entity.name.type.smithy
//                             ^ punctuation.definition.dictionary.end.smithy
    }

    errors: [NotFound]
//  ^^^^^^             support.type.property-name.smithy
//        ^            punctuation.separator.dictionary.key-value.smithy
//          ^          meta.structure.array.smithy punctuation.definition.array.begin.smithy
//           ^^^^^^^^  entity.name.type.smithy
//                   ^ punctuation.definition.array.end.smithy
}

// Entity shape bodies reuse the same `name: [...]` and `name: {...}` spelling for node
// values, so these keep the node value scopes instead of the inline collection ones.
resource Sprocket {
    identifiers: { sprocketId: String }
//  ^^^^^^^^^^^                         support.type.property-name.smithy
//             ^                        punctuation.separator.dictionary.key-value.smithy
//               ^                      meta.structure.dictionary.smithy punctuation.definition.dictionary.begin.smithy
//                 ^^^^^^^^^^           support.type.property-name.smithy
//                           ^          punctuation.separator.dictionary.key-value.smithy
//                             ^^^^^^   entity.name.type.smithy
//                                    ^ punctuation.definition.dictionary.end.smithy

    properties: { size: Integer }
//  ^^^^^^^^^^                    support.type.property-name.smithy
//            ^                   punctuation.separator.dictionary.key-value.smithy
//              ^                 meta.structure.dictionary.smithy punctuation.definition.dictionary.begin.smithy
//                ^^^^            support.type.property-name.smithy
//                    ^           punctuation.separator.dictionary.key-value.smithy
//                      ^^^^^^^   entity.name.type.smithy
//                              ^ punctuation.definition.dictionary.end.smithy

    collectionOperations: [ListSprockets]
//  ^^^^^^^^^^^^^^^^^^^^                  support.type.property-name.smithy
//                      ^                 punctuation.separator.dictionary.key-value.smithy
//                        ^               meta.structure.array.smithy punctuation.definition.array.begin.smithy
//                         ^^^^^^^^^^^^^  entity.name.type.smithy
//                                      ^ punctuation.definition.array.end.smithy

    resources: [Widget]
//  ^^^^^^^^^           support.type.property-name.smithy
//           ^          punctuation.separator.dictionary.key-value.smithy
//             ^        meta.structure.array.smithy punctuation.definition.array.begin.smithy
//              ^^^^^^  entity.name.type.smithy
//                    ^ punctuation.definition.array.end.smithy
}

service Sprockets {
    operations: [GetSprocket]
//  ^^^^^^^^^^                support.type.property-name.smithy
//            ^               punctuation.separator.dictionary.key-value.smithy
//              ^             meta.structure.array.smithy punctuation.definition.array.begin.smithy
//               ^^^^^^^^^^^  entity.name.type.smithy
//                          ^ punctuation.definition.array.end.smithy

    rename: { "com.example#InlineTargets": "Renamed" }
//  ^^^^^^                                             support.type.property-name.smithy
//        ^                                            punctuation.separator.dictionary.key-value.smithy
//          ^                                          meta.structure.dictionary.smithy punctuation.definition.dictionary.begin.smithy
//            ^^^^^^^^^^^^^^^^^^^^^^^^^^^              support.type.property-name.smithy
//                                       ^             punctuation.separator.dictionary.key-value.smithy
//                                         ^           punctuation.definition.string.begin.smithy
//                                          ^^^^^^^    string.quoted.double.smithy
//                                                 ^   punctuation.definition.string.end.smithy
//                                                   ^ punctuation.definition.dictionary.end.smithy
}
