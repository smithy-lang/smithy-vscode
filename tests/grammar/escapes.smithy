// SYNTAX TEST "source.smithy" "This tests string escape sequences"
//
// Smithy's escape set is closed, so anything outside it is flagged. The last two cases are
// deliberately invalid.
$version: "2.1"

namespace com.example

@documentation("quote \" solidus \/ backslash \\ bell \b feed \f")
// <-                                                              punctuation.definition.annotation.smithy
// <~-------------                                                 storage.type.annotation.smithy
//            ^                                                    punctuation.definition.dictionary.begin.smithy
//             ^                                                   punctuation.definition.string.begin.smithy
//              ^^^^^^                                             string.quoted.double.smithy
//                    ^^                                           constant.character.escape.smithy
//                      ^^^^^^^^^                                  string.quoted.double.smithy
//                               ^^                                constant.character.escape.smithy
//                                 ^^^^^^^^^^^                     string.quoted.double.smithy
//                                            ^^                   constant.character.escape.smithy
//                                              ^^^^^^             string.quoted.double.smithy
//                                                    ^^           constant.character.escape.smithy
//                                                      ^^^^^^     string.quoted.double.smithy
//                                                            ^^   constant.character.escape.smithy
//                                                              ^  punctuation.definition.string.end.smithy
//                                                               ^ punctuation.definition.dictionary.end.smithy
string Simple

@documentation("newline \n return \r tab \t unicode ꯍ and ÿ")
// <-                                                         punctuation.definition.annotation.smithy
// <~-------------                                            storage.type.annotation.smithy
//            ^                                               punctuation.definition.dictionary.begin.smithy
//             ^                                              punctuation.definition.string.begin.smithy
//              ^^^^^^^^                                      string.quoted.double.smithy
//                      ^^                                    constant.character.escape.smithy
//                        ^^^^^^^^                            string.quoted.double.smithy
//                                ^^                          constant.character.escape.smithy
//                                  ^^^^^                     string.quoted.double.smithy
//                                       ^^                   constant.character.escape.smithy
//                                         ^^^^^^^^^^^^^^^^   string.quoted.double.smithy
//                                                         ^  punctuation.definition.string.end.smithy
//                                                          ^ punctuation.definition.dictionary.end.smithy
string More

@documentation("""
    a trailing backslash continues the line \
// <-------------------------------------------- string.quoted.double.smithy
//                                          ^    constant.character.escape.smithy
    onto this one
    """)
string Continued

@documentation("unknown \q escape")
// <-                               punctuation.definition.annotation.smithy
// <~-------------                  storage.type.annotation.smithy
//            ^                     punctuation.definition.dictionary.begin.smithy
//             ^                    punctuation.definition.string.begin.smithy
//              ^^^^^^^^            string.quoted.double.smithy
//                      ^^          -constant.character.escape.smithy
//                      ^^          invalid.illegal.escape.smithy
//                        ^^^^^^^   string.quoted.double.smithy
//                               ^  punctuation.definition.string.end.smithy
//                                ^ punctuation.definition.dictionary.end.smithy
string BadEscape

@documentation("short \u12 escape")
// <-                               punctuation.definition.annotation.smithy
// <~-------------                  storage.type.annotation.smithy
//            ^                     punctuation.definition.dictionary.begin.smithy
//             ^                    punctuation.definition.string.begin.smithy
//              ^^^^^^              string.quoted.double.smithy
//                    ^^            invalid.illegal.escape.smithy
//                    ^^^^          -constant.character.escape.smithy
//                      ^^^^^^^^^   string.quoted.double.smithy
//                               ^  punctuation.definition.string.end.smithy
//                                ^ punctuation.definition.dictionary.end.smithy
string ShortUnicode
