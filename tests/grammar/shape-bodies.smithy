// SYNTAX TEST "source.smithy" "This tests how a shape's type decides how its body is read"
$version: "2.1"

namespace com.example

// A shape may be indented, and may share a line with a preceding trait. Both forms still
// resolve to the shape's own body rules rather than to the generic brace fallback.
    structure Indented {
//  ^^^^^^^^^            keyword.statement.smithy
//            ^^^^^^^^   entity.name.type.smithy
//                     ^ punctuation.definition.dictionary.begin.smithy
        tags: [String]
//      ^^^^           support.type.property-name.smithy
//          ^          punctuation.separator.dictionary.key-value.smithy
//            ^        meta.structure.inline-list.smithy punctuation.definition.array.begin.smithy
//             ^^^^^^  entity.name.type.smithy
//                   ^ punctuation.definition.array.end.smithy
    }

@tags(["x"]) structure SameLine { tags: [String] }
// <-                                              punctuation.definition.annotation.smithy
// <~----                                          storage.type.annotation.smithy
//   ^                                             punctuation.definition.dictionary.begin.smithy
//    ^                                            meta.structure.array.smithy punctuation.definition.array.begin.smithy
//     ^                                           punctuation.definition.string.begin.smithy
//      ^                                          string.quoted.double.smithy
//       ^                                         punctuation.definition.string.end.smithy
//        ^                                        punctuation.definition.array.end.smithy
//         ^                                       punctuation.definition.dictionary.end.smithy
//           ^^^^^^^^^                             keyword.statement.smithy
//                     ^^^^^^^^                    entity.name.type.smithy
//                              ^                  punctuation.definition.dictionary.begin.smithy
//                                ^^^^             support.type.property-name.smithy
//                                    ^            punctuation.separator.dictionary.key-value.smithy
//                                      ^          meta.structure.inline-list.smithy punctuation.definition.array.begin.smithy
//                                       ^^^^^^    entity.name.type.smithy
//                                             ^   punctuation.definition.array.end.smithy
//                                               ^ punctuation.definition.dictionary.end.smithy

// The brace may sit on a later line, with a comment in between.
structure BraceLater
// <---------        keyword.statement.smithy
//        ^^^^^^^^^^ entity.name.type.smithy
// the body follows
{
// <- punctuation.definition.dictionary.begin.smithy
    tags: [String]
//  ^^^^           support.type.property-name.smithy
//      ^          punctuation.separator.dictionary.key-value.smithy
//        ^        meta.structure.inline-list.smithy punctuation.definition.array.begin.smithy
//         ^^^^^^  entity.name.type.smithy
//               ^ punctuation.definition.array.end.smithy
}

// A resource body is a node object whichever way it is written, so these keys are property
// names and the brackets and braces are node values.
resource Sprocket
// <--------      keyword.statement.smithy
//       ^^^^^^^^ entity.name.type.smithy
// the body follows
{
// <- punctuation.definition.dictionary.begin.smithy
    identifiers: { sprocketId: String }
//  ^^^^^^^^^^^                         support.type.property-name.smithy
//             ^                        punctuation.separator.dictionary.key-value.smithy
//               ^                      meta.structure.dictionary.smithy punctuation.definition.dictionary.begin.smithy
//                 ^^^^^^^^^^           support.type.property-name.smithy
//                           ^          punctuation.separator.dictionary.key-value.smithy
//                             ^^^^^^   entity.name.type.smithy
//                                    ^ punctuation.definition.dictionary.end.smithy

    operations: [GetSprocket]
//  ^^^^^^^^^^                support.type.property-name.smithy
//            ^               punctuation.separator.dictionary.key-value.smithy
//              ^             meta.structure.array.smithy punctuation.definition.array.begin.smithy
//               ^^^^^^^^^^^  entity.name.type.smithy
//                          ^ punctuation.definition.array.end.smithy
}

// The ABNF allows whitespace, a newline or a comment between `with` and its bracket.
string NoSpace with[BaseEnum]
// <------                    keyword.statement.smithy
//     ^^^^^^^                entity.name.type.smithy
//             ^^^^           keyword.statement.with.smithy
//                 ^          punctuation.definition.array.begin.smithy
//                  ^^^^^^^^  entity.name.type.smithy
//                          ^ punctuation.definition.array.end.smithy

structure OnNextLine with
// <---------             keyword.statement.smithy
//        ^^^^^^^^^^      entity.name.type.smithy
//                   ^^^^ keyword.statement.with.smithy
    [BaseEnum] {
//  ^            punctuation.definition.array.begin.smithy
//   ^^^^^^^^    entity.name.type.smithy
//           ^   punctuation.definition.array.end.smithy
//             ^ punctuation.definition.dictionary.begin.smithy
    a: String
}

structure AfterComment with // trailing
// <---------                           keyword.statement.smithy
//        ^^^^^^^^^^^^                  entity.name.type.smithy
//                     ^^^^             keyword.statement.with.smithy
//                          ^^^^^^^^^^^ comment.line.double-slash.smithy
    [BaseEnum] {
//  ^            punctuation.definition.array.begin.smithy
//   ^^^^^^^^    entity.name.type.smithy
//           ^   punctuation.definition.array.end.smithy
//             ^ punctuation.definition.dictionary.begin.smithy
    b: String
}

// `for` is legal on any aggregate shape, not just structures.
union Chooser for Sprocket {
// <-----                    keyword.statement.smithy
//    ^^^^^^^                entity.name.type.smithy
//            ^^^            keyword.statement.for-resource.smithy
//                ^^^^^^^^   entity.name.type.smithy
//                         ^ punctuation.definition.dictionary.begin.smithy
    $sprocketId
//  ^           keyword.statement.elision.smithy
//   ^^^^^^^^^^ support.type.property-name.smithy
}

list Listing for Sprocket {
// <----                    keyword.statement.smithy
//   ^^^^^^^                entity.name.type.smithy
//           ^^^            keyword.statement.for-resource.smithy
//               ^^^^^^^^   entity.name.type.smithy
//                        ^ punctuation.definition.dictionary.begin.smithy
    member: String
}

map Mapping for Sprocket {
// <---                    keyword.statement.smithy
//  ^^^^^^^                entity.name.type.smithy
//          ^^^            keyword.statement.for-resource.smithy
//              ^^^^^^^^   entity.name.type.smithy
//                       ^ punctuation.definition.dictionary.begin.smithy
    key: String

    value: String
}

@mixin
enum BaseEnum {
// <----        keyword.statement.smithy
//   ^^^^^^^^   entity.name.type.smithy
//            ^ punctuation.definition.dictionary.begin.smithy
    A
}

enum Mixed with [BaseEnum] {
// <----                     keyword.statement.smithy
//   ^^^^^                   entity.name.type.smithy
//         ^^^^              keyword.statement.with.smithy
//              ^            punctuation.definition.array.begin.smithy
//               ^^^^^^^^    entity.name.type.smithy
//                       ^   punctuation.definition.array.end.smithy
//                         ^ punctuation.definition.dictionary.begin.smithy
    B
}

@mixin
intEnum BaseInt {
// <-------       keyword.statement.smithy
//      ^^^^^^^   entity.name.type.smithy
//              ^ punctuation.definition.dictionary.begin.smithy
    A = 1
}

intEnum MixedInt with [BaseInt] {
// <-------                       keyword.statement.smithy
//      ^^^^^^^^                  entity.name.type.smithy
//               ^^^^             keyword.statement.with.smithy
//                    ^           punctuation.definition.array.begin.smithy
//                     ^^^^^^^    entity.name.type.smithy
//                            ^   punctuation.definition.array.end.smithy
//                              ^ punctuation.definition.dictionary.begin.smithy
    B = 2
}

operation GetSprocket {
    input := for Sprocket with [BaseEnum] {
//  ^^^^^                                   support.type.property-name.smithy
//        ^^                                punctuation.separator.dictionary.inline-struct.smithy
//           ^^^                            keyword.statement.for-resource.smithy
//               ^^^^^^^^                   entity.name.type.smithy
//                        ^^^^              keyword.statement.with.smithy
//                             ^            punctuation.definition.array.begin.smithy
//                              ^^^^^^^^    entity.name.type.smithy
//                                      ^   punctuation.definition.array.end.smithy
//                                        ^ punctuation.definition.dictionary.begin.smithy
        $sprocketId
//      ^           keyword.statement.elision.smithy
//       ^^^^^^^^^^ support.type.property-name.smithy

        meta: Document = { "k": 1 }
//      ^^^^                        support.type.property-name.smithy
//          ^                       punctuation.separator.dictionary.key-value.smithy
//            ^^^^^^^^              entity.name.type.smithy
//                     ^            keyword.operator.smithy
//                       ^          meta.structure.dictionary.smithy punctuation.definition.dictionary.begin.smithy
//                         ^^^      support.type.property-name.smithy
//                            ^     punctuation.separator.dictionary.key-value.smithy
//                              ^   constant.numeric.smithy
//                                ^ punctuation.definition.dictionary.end.smithy

        tags: [String]
//      ^^^^           support.type.property-name.smithy
//          ^          punctuation.separator.dictionary.key-value.smithy
//            ^        meta.structure.inline-list.smithy punctuation.definition.array.begin.smithy
//             ^^^^^^  entity.name.type.smithy
//                   ^ punctuation.definition.array.end.smithy
    }

    output: Unit
//  ^^^^^^       support.type.property-name.smithy
//        ^      punctuation.separator.dictionary.key-value.smithy
//          ^^^^ entity.name.type.smithy
}

string AfterAll
// <------      keyword.statement.smithy
//     ^^^^^^^^ entity.name.type.smithy
