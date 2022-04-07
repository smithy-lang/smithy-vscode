// SYNTAX TEST "source.smithy" "This tests resource shapes"
$version: "2.0"

namespace com.example

service Service {
// <-------       keyword.statement.smithy
//      ^^^^^^^   entity.name.type.smithy
//              ^ punctuation.definition.dictionary.begin.smithy

    version: "2020-02-02"
//  ^^^^^^^               support.type.property-name.smithy
//         ^              punctuation.separator.dictionary.key-value.smithy
//           ^^^^^^^^^^^^ string.quoted.double.smithy

    operations: [
//  ^^^^^^^^^^    support.type.property-name.smithy
//            ^   punctuation.separator.dictionary.key-value.smithy
//              ^ punctuation.definition.array.begin.smithy

        Operation
//      ^^^^^^^^^ entity.name.type.smithy

    ]
//  ^ punctuation.definition.array.end.smithy

    resources: [
//  ^^^^^^^^^    support.type.property-name.smithy
//           ^   punctuation.separator.dictionary.key-value.smithy
//             ^ punctuation.definition.array.begin.smithy

        Resource
//      ^^^^^^^^ entity.name.type.smithy

    ]
//  ^ punctuation.definition.array.end.smithy

    errors: [
//  ^^^^^^    support.type.property-name.smithy
//        ^   punctuation.separator.dictionary.key-value.smithy
//          ^ punctuation.definition.array.begin.smithy

        Error
//      ^^^^^ entity.name.type.smithy

    ]
//  ^ punctuation.definition.array.end.smithy

    rename: {
//  ^^^^^^    support.type.property-name.smithy
//        ^   punctuation.separator.dictionary.key-value.smithy
//          ^ punctuation.definition.dictionary.begin.smithy

        Foo: "Bar"
//      ^^^        support.type.property-name.smithy
//         ^       punctuation.separator.dictionary.key-value.smithy
//           ^^^^^ string.quoted.double.smithy

    }
//  ^ punctuation.definition.dictionary.end.smithy

}
// <- punctuation.definition.dictionary.end.smithy

operation Operation {
// <---------         keyword.statement.smithy
//        ^^^^^^^^^   entity.name.type.smithy
//                  ^ punctuation.definition.dictionary.begin.smithy

    input := {
//  ^^^^^      support.type.property-name.smithy
//        ^^   punctuation.separator.dictionary.inline-struct.smithy
//           ^ punctuation.definition.dictionary.begin.smithy

        foo: Bar
//      ^^^      support.type.property-name.smithy
//         ^     punctuation.separator.dictionary.key-value.smithy
//           ^^^ entity.name.type.smithy

    }
//  ^ punctuation.definition.dictionary.end.smithy

    output: OperationOutput
//  ^^^^^^                  support.type.property-name.smithy
//        ^                 punctuation.separator.dictionary.key-value.smithy
//          ^^^^^^^^^^^^^^^ entity.name.type.smithy

    errors: [
//  ^^^^^^    support.type.property-name.smithy
//        ^   punctuation.separator.dictionary.key-value.smithy
//          ^ punctuation.definition.array.begin.smithy

        Error
//      ^^^^^ entity.name.type.smithy

    ]
//  ^ punctuation.definition.array.end.smithy

}
// <- punctuation.definition.dictionary.end.smithy

operation OtherOperation {
// <---------              keyword.statement.smithy
//        ^^^^^^^^^^^^^^   entity.name.type.smithy
//                       ^ punctuation.definition.dictionary.begin.smithy

    input := with [Bar] {}
//  ^^^^^                  support.type.property-name.smithy
//        ^^               punctuation.separator.dictionary.inline-struct.smithy
//           ^^^^          keyword.statement.with.smithy
//                ^        punctuation.definition.array.begin.smithy
//                 ^^^     entity.name.type.smithy
//                    ^    punctuation.definition.array.end.smithy
//                      ^  punctuation.definition.dictionary.begin.smithy
//                       ^ punctuation.definition.dictionary.end.smithy

    output := @sensitive {}
//  ^^^^^^                  support.type.property-name.smithy
//         ^^               punctuation.separator.dictionary.inline-struct.smithy
//            ^             punctuation.definition.annotation.smithy
//             ^^^^^^^^^    storage.type.annotation.smithy
//                       ^  punctuation.definition.dictionary.begin.smithy
//                        ^ punctuation.definition.dictionary.end.smithy

}
// <- punctuation.definition.dictionary.end.smithy

resource Resource {
// <--------        keyword.statement.smithy
//       ^^^^^^^^   entity.name.type.smithy
//                ^ punctuation.definition.dictionary.begin.smithy

    identifiers: {
//  ^^^^^^^^^^^    support.type.property-name.smithy
//             ^   punctuation.separator.dictionary.key-value.smithy
//               ^ punctuation.definition.dictionary.begin.smithy

        "id": String
//      ^^^^         support.type.property-name.smithy
//          ^        punctuation.separator.dictionary.key-value.smithy
//            ^^^^^^ entity.name.type.smithy

    }
//  ^ punctuation.definition.dictionary.end.smithy

    create: Create
//  ^^^^^^         support.type.property-name.smithy
//        ^        punctuation.separator.dictionary.key-value.smithy
//          ^^^^^^ entity.name.type.smithy

    put: Put
//  ^^^      support.type.property-name.smithy
//     ^     punctuation.separator.dictionary.key-value.smithy
//       ^^^ entity.name.type.smithy

    read: Read
//  ^^^^       support.type.property-name.smithy
//      ^      punctuation.separator.dictionary.key-value.smithy
//        ^^^^ entity.name.type.smithy

    update: Update
//  ^^^^^^         support.type.property-name.smithy
//        ^        punctuation.separator.dictionary.key-value.smithy
//          ^^^^^^ entity.name.type.smithy

    delete: Delete
//  ^^^^^^         support.type.property-name.smithy
//        ^        punctuation.separator.dictionary.key-value.smithy
//          ^^^^^^ entity.name.type.smithy

    list: List
//  ^^^^       support.type.property-name.smithy
//      ^      punctuation.separator.dictionary.key-value.smithy
//        ^^^^ entity.name.type.smithy

    operations: [
//  ^^^^^^^^^^    support.type.property-name.smithy
//            ^   punctuation.separator.dictionary.key-value.smithy
//              ^ punctuation.definition.array.begin.smithy

        Operation
//      ^^^^^^^^^ entity.name.type.smithy

    ]
//  ^ punctuation.definition.array.end.smithy

    collectionOperations: [
//  ^^^^^^^^^^^^^^^^^^^^    support.type.property-name.smithy
//                      ^   punctuation.separator.dictionary.key-value.smithy
//                        ^ punctuation.definition.array.begin.smithy

        CollectionOperation
//      ^^^^^^^^^^^^^^^^^^^ entity.name.type.smithy

    ]
//  ^ punctuation.definition.array.end.smithy

    resources: [
//  ^^^^^^^^^    support.type.property-name.smithy
//           ^   punctuation.separator.dictionary.key-value.smithy
//             ^ punctuation.definition.array.begin.smithy

        SubResource
//      ^^^^^^^^^^^ entity.name.type.smithy

    ]
//  ^ punctuation.definition.array.end.smithy

}
// <- punctuation.definition.dictionary.end.smithy