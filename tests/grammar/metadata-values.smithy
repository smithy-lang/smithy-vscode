// SYNTAX TEST "source.smithy" "This tests metadata with non-string values"
$version: "2.0"

// A value containing '=' must not be mistaken for the key/operator separator.
metadata withEquals = "a = b"
//       ^^^^^^^^^^             variable.other.smithy
//                  ^          keyword.operator.smithy
//                    ^^^^^^^^ string.quoted.double.smithy

metadata anArray = [1, 2, 3]
//       ^^^^^^^ variable.other.smithy
//               ^ keyword.operator.smithy
//                 ^ punctuation.definition.array.begin.smithy
//                  ^ constant.numeric.smithy
//                         ^ punctuation.definition.array.end.smithy

metadata anObject = {
//       ^^^^^^^^            variable.other.smithy
//                ^         keyword.operator.smithy
//                  ^       punctuation.definition.dictionary.begin.smithy
    key: "value"
//  ^^^          support.type.property-name.smithy
//       ^^^^^^^ string.quoted.double.smithy
}
//<- punctuation.definition.dictionary.end.smithy
