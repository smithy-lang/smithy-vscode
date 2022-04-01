# Smithy for VS Code

This package is a Visual Studio Code extension to recognize and highlight the
Smithy interface definition language (IDL). It can also be used as a TextMate
bundle in TextMate and [IntelliJ using a third-party plugin](https://www.jetbrains.com/help/idea/importing-textmate-bundles.html).

## Features

This extension provides basic syntax highlighting of ".smithy" files.

Additionally, it provides [Snippets](https://code.visualstudio.com/docs/editor/userdefinedsnippets).

## Installation

### VS Code

This extension is not yet published, so you will need to install it manually
by copying the contents of this repository into the `<user home>/.vscode/extensions`
folder and restart Code.

### IntelliJ

You can use this extension in IntelliJ by installing the
"TextMate bundle support" plugin and registering this repository as a bundle.
See the [IntelliJ documentation](https://www.jetbrains.com/help/idea/textmate.html)
for more details.

## Release Notes

### 0.3.0 - 2020-09-19

- Updated to work with Smithy 1.0 syntax.

### 0.2.0 - 2019-06-26

- Add support for use statements.
- Add support for documentation comments.

### 0.1.0

Initial release for Smithy IDL syntax highlighting.
