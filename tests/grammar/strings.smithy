// SYNTAX TEST "source.smithy" "This tests quoted strings and text blocks"
$version: "2.0"

namespace com.example

@documentation("a \n b \t c \\ d")
//             ^ punctuation.definition.string.begin.smithy
//                ^^ constant.character.escape.smithy
//                     ^^ constant.character.escape.smithy
//                          ^^ constant.character.escape.smithy
string Simple

@documentation("""
//             ^^^ punctuation.definition.string.begin.smithy
    Multi-line text block
//  ^^^^^^^^^^^^^^^^^^^^^^ string.quoted.double.smithy
    with an escape \t here
//                 ^^ constant.character.escape.smithy
    """)
//  ^^^ punctuation.definition.string.end.smithy
string Documented
