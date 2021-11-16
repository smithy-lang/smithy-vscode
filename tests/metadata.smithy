// SYNTAX TEST "source.smithy" "This tests metadata statments"
$version: "2.0"

metadata foo = "bar"
// <--------         keyword.statement.smithy
//       ^^^         variable.other.smithy
//           ^       keyword.operator.smithy
//             ^^^^^ string.quoted.double.smithy

metadata "foo" = "bar"
//       ^^^^^         variable.other.smithy