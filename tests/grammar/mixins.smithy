// SYNTAX TEST "source.smithy" "This tests using mixins on all shape types"
$version: "2.0"

namespace smithy.example

@mixin
blob MixinBlob

blob MixedBlob with [MixinBlob]
// <----                        keyword.statement.smithy
//   ^^^^^^^^^                  entity.name.type.smithy
//             ^^^^             keyword.statement.with.smithy
//                  ^           punctuation.definition.array.begin.smithy
//                   ^^^^^^^^^  entity.name.type.smithy
//                            ^ punctuation.definition.array.end.smithy

@mixin
boolean MixinBoolean

boolean MixedBoolean with [MixinBoolean]
// <-------                              keyword.statement.smithy
//      ^^^^^^^^^^^^                     entity.name.type.smithy
//                   ^^^^                keyword.statement.with.smithy
//                        ^              punctuation.definition.array.begin.smithy
//                         ^^^^^^^^^^^^  entity.name.type.smithy
//                                     ^ punctuation.definition.array.end.smithy

@mixin
string MixinString

string MixedString with [MixinString]
// <------                            keyword.statement.smithy
//     ^^^^^^^^^^^                    entity.name.type.smithy
//                 ^^^^               keyword.statement.with.smithy
//                      ^             punctuation.definition.array.begin.smithy
//                       ^^^^^^^^^^^  entity.name.type.smithy
//                                  ^ punctuation.definition.array.end.smithy

@mixin
byte MixinByte

byte MixedByte with [MixinByte]
// <----                        keyword.statement.smithy
//   ^^^^^^^^^                  entity.name.type.smithy
//             ^^^^             keyword.statement.with.smithy
//                  ^           punctuation.definition.array.begin.smithy
//                   ^^^^^^^^^  entity.name.type.smithy
//                            ^ punctuation.definition.array.end.smithy

@mixin
short MixinShort

short MixedShort with [MixinShort]
// <-----                          keyword.statement.smithy
//    ^^^^^^^^^^                   entity.name.type.smithy
//               ^^^^              keyword.statement.with.smithy
//                    ^            punctuation.definition.array.begin.smithy
//                     ^^^^^^^^^^  entity.name.type.smithy
//                               ^ punctuation.definition.array.end.smithy

@mixin
integer MixinInteger

integer MixedInteger with [MixinInteger]
// <-------                              keyword.statement.smithy
//      ^^^^^^^^^                        entity.name.type.smithy
//                   ^^^^                keyword.statement.with.smithy
//                        ^              punctuation.definition.array.begin.smithy
//                         ^^^^^^^^^^^^  entity.name.type.smithy
//                                     ^ punctuation.definition.array.end.smithy

@mixin
long MixinLong

long MixedLong with [MixinLong]
// <----                        keyword.statement.smithy
//   ^^^^^^^^^                  entity.name.type.smithy
//             ^^^^             keyword.statement.with.smithy
//                  ^           punctuation.definition.array.begin.smithy
//                   ^^^^^^^^^  entity.name.type.smithy
//                            ^ punctuation.definition.array.end.smithy

@mixin
float MixinFloat

float MixedFloat with [MixinFloat]
// <-----                          keyword.statement.smithy
//    ^^^^^^^^^^                   entity.name.type.smithy
//               ^^^^              keyword.statement.with.smithy
//                    ^            punctuation.definition.array.begin.smithy
//                     ^^^^^^^^^^  entity.name.type.smithy
//                               ^ punctuation.definition.array.end.smithy

@mixin
double MixinDouble

double MixedDouble with [MixinDouble]
// <------                            keyword.statement.smithy
//     ^^^^^^^^^^^                    entity.name.type.smithy
//                 ^^^^               keyword.statement.with.smithy
//                      ^             punctuation.definition.array.begin.smithy
//                       ^^^^^^^^^^^  entity.name.type.smithy
//                                  ^ punctuation.definition.array.end.smithy

@mixin
bigInteger MixinBigInt

bigInteger MixedBigInt with [MixinBigInt]
// <----------                            keyword.statement.smithy
//         ^^^^^^^^^^^                    entity.name.type.smithy
//                     ^^^^               keyword.statement.with.smithy
//                          ^             punctuation.definition.array.begin.smithy
//                           ^^^^^^^^^^^  entity.name.type.smithy
//                                      ^ punctuation.definition.array.end.smithy

@mixin
bigDecimal MixinBigDecimal

bigDecimal MixedBigDecimal with [MixinBigDecimal]
// <----------                                    keyword.statement.smithy
//         ^^^^^^^^^^^^^^^                        entity.name.type.smithy
//                         ^^^^                   keyword.statement.with.smithy
//                              ^                 punctuation.definition.array.begin.smithy
//                               ^^^^^^^^^^^^^^^  entity.name.type.smithy
//                                              ^ punctuation.definition.array.end.smithy

@mixin
timestamp MixinTimestamp

timestamp MixedTimestamp with [MixinTimestamp]
// <---------                                  keyword.statement.smithy
//        ^^^^^^^^^^^^^^                       entity.name.type.smithy
//                       ^^^^                  keyword.statement.with.smithy
//                            ^                punctuation.definition.array.begin.smithy
//                             ^^^^^^^^^^^^^^  entity.name.type.smithy
//                                           ^ punctuation.definition.array.end.smithy

@mixin
document MixinDocument

document MixedDocument with [MixinDocument]
// <--------                                keyword.statement.smithy
//       ^^^^^^^^^^^^^                      entity.name.type.smithy
//                     ^^^^                 keyword.statement.with.smithy
//                          ^               punctuation.definition.array.begin.smithy
//                           ^^^^^^^^^^^^^  entity.name.type.smithy
//                                        ^ punctuation.definition.array.end.smithy


list MixedList with [MixinList] {}
// <----                           keyword.statement.smithy
//   ^^^^^^^^^                     entity.name.type.smithy
//             ^^^^                keyword.statement.with.smithy
//                  ^              punctuation.definition.array.begin.smithy
//                   ^^^^^^^^^     entity.name.type.smithy
//                            ^    punctuation.definition.array.end.smithy
//                              ^  punctuation.definition.dictionary.begin.smithy
//                               ^ punctuation.definition.dictionary.end.smithy

@mixin
set MixinSet {
    member: String
}

set MixedSet with [MixinSet] {}
// <---                         keyword.statement.smithy
//  ^^^^^^^^                    entity.name.type.smithy
//           ^^^^               keyword.statement.with.smithy
//                ^             punctuation.definition.array.begin.smithy
//                 ^^^^^^^^     entity.name.type.smithy
//                         ^    punctuation.definition.array.end.smithy
//                           ^  punctuation.definition.dictionary.begin.smithy
//                            ^ punctuation.definition.dictionary.end.smithy

@mixin
map MixinMap {
    key: String
    value: String
}

map MixedMap with [MixinMap] {}
// <---                         keyword.statement.smithy
//  ^^^^^^^^                    entity.name.type.smithy
//           ^^^^               keyword.statement.with.smithy
//                ^             punctuation.definition.array.begin.smithy
//                 ^^^^^^^^     entity.name.type.smithy
//                         ^    punctuation.definition.array.end.smithy
//                           ^  punctuation.definition.dictionary.begin.smithy
//                            ^ punctuation.definition.dictionary.end.smithy

@mixin
structure MixinStructure {}

structure MixedStructure with [MixinStructure] {}
// <---------                                     keyword.statement.smithy
//        ^^^^^^^^^^^^^^                          entity.name.type.smithy
//                       ^^^^                     keyword.statement.with.smithy
//                            ^                   punctuation.definition.array.begin.smithy
//                             ^^^^^^^^^^^^^^     entity.name.type.smithy
//                                           ^    punctuation.definition.array.end.smithy
//                                             ^  punctuation.definition.dictionary.begin.smithy
//                                              ^ punctuation.definition.dictionary.end.smithy

@mixin
service MixinService {}

service MixedService with [MixinService] {}
// <-------                                 keyword.statement.smithy
//      ^^^^^^^^^^^^                        entity.name.type.smithy
//                   ^^^^                   keyword.statement.with.smithy
//                        ^                 punctuation.definition.array.begin.smithy
//                         ^^^^^^^^^^^^     entity.name.type.smithy
//                                     ^    punctuation.definition.array.end.smithy
//                                       ^  punctuation.definition.dictionary.begin.smithy
//                                        ^ punctuation.definition.dictionary.end.smithy

@mixin
resource MixinResource {}

resource MixedResource with [MixinResource] {}
// <--------                                   keyword.statement.smithy
//       ^^^^^^^^^^^^^                         entity.name.type.smithy
//                     ^^^^                    keyword.statement.with.smithy
//                          ^                  punctuation.definition.array.begin.smithy
//                           ^^^^^^^^^^^^^     entity.name.type.smithy
//                                        ^    punctuation.definition.array.end.smithy
//                                          ^  punctuation.definition.dictionary.begin.smithy
//                                           ^ punctuation.definition.dictionary.end.smithy

@mixin
operation MixinOperation {}

operation MixedOperation with [MixinOperation] {}
// <---------                                     keyword.statement.smithy
//        ^^^^^^^^^^^^^^                          entity.name.type.smithy
//                       ^^^^                     keyword.statement.with.smithy
//                            ^                   punctuation.definition.array.begin.smithy
//                             ^^^^^^^^^^^^^^     entity.name.type.smithy
//                                           ^    punctuation.definition.array.end.smithy
//                                             ^  punctuation.definition.dictionary.begin.smithy
//                                              ^ punctuation.definition.dictionary.end.smithy

@mixin
operation MixinOperation2 {}

operation MultiMixedOperation with [
// <---------                        keyword.statement.smithy
//        ^^^^^^^^^^^^^^^^^^^        entity.name.type.smithy
//                            ^^^^   keyword.statement.with.smithy
//                                 ^ punctuation.definition.array.begin.smithy

    MixinOperation
//  ^^^^^^^^^^^^^^ entity.name.type.smithy

    MixinOperation2
//  ^^^^^^^^^^^^^^^ entity.name.type.smithy

] {}
// <-   punctuation.definition.array.end.smithy
// <~~- punctuation.definition.dictionary.begin.smithy
// ^    punctuation.definition.dictionary.end.smithy

operation MultiMixedOperation2 with [MixinOperation, MixinOperation2] {}
// <---------                                                            keyword.statement.smithy
//        ^^^^^^^^^^^^^^^^^^^^                                           entity.name.type.smithy
//                             ^^^^                                      keyword.statement.with.smithy
//                                  ^                                    punctuation.definition.array.begin.smithy
//                                   ^^^^^^^^^^^^^^                      entity.name.type.smithy
//                                                 ^                     punctuation.separator.array.smithy
//                                                   ^^^^^^^^^^^^^^^     entity.name.type.smithy
//                                                                  ^    punctuation.definition.array.end.smithy
//                                                                    ^  punctuation.definition.dictionary.begin.smithy
//                                                                     ^ punctuation.definition.dictionary.end.smithy