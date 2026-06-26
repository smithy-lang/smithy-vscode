// SYNTAX TEST "source.smithy" "This tests identifier and shape-id boundaries"
$version: "2.0"

namespace com.example

@trait
structure my_trait {}

// Identifiers may start with and contain underscores.
string _Underscore_Name
//     ^^^^^^^^^^^^^^^^^ entity.name.type.smithy

// Trait shape ids may be namespaced and contain underscores.
@com.example#my_trait
// <~-------------------- storage.type.annotation.smithy
string Annotated

// Mixin references in a with list are full shape ids.
@mixin
structure Base {}

structure Derived with [com.example#Base] {
//                      ^^^^^^^^^^^^^^^^ entity.name.type.smithy
    value: String
}
