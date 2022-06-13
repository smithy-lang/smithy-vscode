# Smithy for VS Code

This package is a Visual Studio Code extension to recognize and highlight the
Smithy interface definition language (IDL). It can also be used as a TextMate
bundle in TextMate and [IntelliJ using a third-party plugin](https://www.jetbrains.com/help/idea/importing-textmate-bundles.html).

## Features

This extension provides basic syntax highlighting of ".smithy" files.

Additionally, it provides [Snippets](https://code.visualstudio.com/docs/editor/userdefinedsnippets).

## Installation

### VS Code

This extension is not yet published. To use this extension, manually installing
the Extension with the following steps:
* Clone the Extension: `git clone https://github.com/awslabs/smithy-vscode.git && cd smithy-vscode`
* Run npm commands to install:
`npm install && npm run install-plugin`
* Open VS Code and add a `smithy-build.json` file to the root of your project,
specifying any Maven dependencies used by your model, along with the
repositories where they can be located.
```
{
    {
    "maven": {
      "dependencies": ["software.amazon.smithy:smithy-aws-traits:1.19.0"],
      "repositories": [{ "url": "https://repo1.maven.org/maven2/" }]
    }
  }
}
```
* Start authoring your Smithy model. Opening a `*.smithy` file will activate
the extension.

### IntelliJ

You can use this extension in IntelliJ by installing the
"TextMate bundle support" plugin and registering this repository as a bundle.
See the [IntelliJ documentation](https://www.jetbrains.com/help/idea/textmate.html)
for more details.

## Release Notes

### 0.4.0 - 2022-06-13

- Updated to work with Smithy 2.0 syntax.
- Use [Smithy Language Server](https://github.com/awslabs/smithy-language-server/) for language features including:
auto-completion, jump to definition, model validations as diagnostics. [#32](https://github.com/awslabs/smithy-vscode/pull/32)
- Added `Smithy:Selector:Run` and `Smithy:Selector:Clear` commands for highlighting the results of running an
expression on the model in a workspace. [#33](https://github.com/awslabs/smithy-vscode/pull/33)

### 0.3.0 - 2020-09-19

- Updated to work with Smithy 1.0 syntax.

### 0.2.0 - 2019-06-26

- Add support for use statements.
- Add support for documentation comments.

### 0.1.0

Initial release for Smithy IDL syntax highlighting.
