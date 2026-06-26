// SYNTAX TEST "source.smithy" "This tests line and documentation comments"
$version: "2.0"

namespace com.example // trailing comment on a namespace statement
//        ^^^^^^^^^^^ entity.name.type.smithy
//                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ comment.line.double-slash.smithy

use smithy.api#Integer // trailing comment on a use statement
//  ^^^^^^^^^^^^^^^^^^ entity.name.type.smithy
//                     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ comment.line.double-slash.smithy

/// Documentation comment
// <------------------------ comment.block.documentation.smithy

// Plain line comment
// <--------------------- comment.line.double-slash.smithy

structure Foo {
    /// Member documentation
//  ^^^^^^^^^^^^^^^^^^^^^^^^^ comment.block.documentation.smithy
    bar: Integer // trailing line comment
//               ^^^^^^^^^^^^^^^^^^^^^^^^ comment.line.double-slash.smithy
}
