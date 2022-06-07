// SYNTAX TEST "source.smithy" "This tests aggregate shapes"
$version: "2.0"

namespace smithy.example

resource User {
    identifiers: {
        uuid: String
    }
}

@mixin
structure UserMixin {
    uuid: String
}

structure UserStructWithResource for User {
//                               ^^^      keyword.statement.for-resource.smithy
//                                   ^^^^ entity.name.type.smithy

    $uuid
//  ^     keyword.statement.elision.smithy
//   ^^^^ support.type.property-name.smithy
}

structure UserStructWithMixin with [UserMixin] {
    $name
//  ^     keyword.statement.elision.smithy
//   ^^^^ support.type.property-name.smithy
}

structure UserStructWithResourceAndMixin for User with [UserMixin] {
//                                       ^^^                       keyword.statement.for-resource.smithy
//                                           ^^^^                  entity.name.type.smithy
//                                                ^^^^             keyword.statement.with.smithy
//                                                     ^           punctuation.definition.array.begin.smithy
//                                                      ^^^^^^^^^  entity.name.type.smithy
//                                                               ^ punctuation.definition.array.end.smithy

    $uuid
//  ^     keyword.statement.elision.smithy
//   ^^^^ support.type.property-name.smithy

    $name
//  ^     keyword.statement.elision.smithy
//   ^^^^ support.type.property-name.smithy
}
