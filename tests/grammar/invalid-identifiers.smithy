// SYNTAX TEST "source.smithy" "This tests highlighting of invalid identifier syntax"
// NOTE: This file intentionally contains invalid Smithy syntax. It verifies that the
// highlighter draws identifier boundaries correctly even on malformed input; it is not
// expected to pass `smithy build`.
$version: "2.0"

namespace com.example

// Hyphens are not valid identifier characters, so the shape name ends at the hyphen
// and the trailing "-bar" is not highlighted as part of the type name.
string foo-bar
//     ^^^ entity.name.type.smithy
//        ^ -entity.name.type.smithy
