# Smithy for VS Code

This package is a Visual Studio Code extension to recognize and highlight the
Smithy interface definition language (IDL). It can also be used as a TextMate
bundle in TextMate and [IntelliJ using a third-party plugin](https://www.jetbrains.com/help/idea/importing-textmate-bundles.html).

## Features

This extension provides basic syntax highlighting of ".smithy" files.

Additionally, it provides [Snippets](https://code.visualstudio.com/docs/editor/userdefinedsnippets).

## Installation

This extension can be installed from the
[VS Code Extension Marketplace](https://marketplace.visualstudio.com/items?itemName=smithy.smithy-vscode-extension).

To install from source, follow these steps:
* Clone the repository: `git clone https://github.com/awslabs/smithy-vscode.git && cd smithy-vscode`
* Run npm commands to install:
`npm install && npm run install-plugin`

## Authoring a model
If your model requires dependencies, add a `smithy-build.json` file to the root of your project, specifying Maven dependencies, along with the
repositories where they can be located.
```
{
    {
    "maven": {
      "dependencies": ["software.amazon.smithy:smithy-aws-traits:1.25.0"],
      "repositories": [{ "url": "https://repo1.maven.org/maven2/" }]
    }
  }
}
```
Start authoring your Smithy model. Opening a `*.smithy` file will activate
the extension.

## Use with IntelliJ

You can use this extension for syntax highlighting in IntelliJ by installing the
"TextMate bundle support" plugin and registering this repository as a bundle.
See the [IntelliJ documentation](https://www.jetbrains.com/help/idea/textmate.html)
for more details.

## Release Notes

### 0.5.1 - 2022-09-29

- Updated to use [Smithy Language Server 0.2.1](https://github.com/awslabs/smithy-language-server/)
- Stop switching focus to VSCode's output window when the extension receives a message [#55](https://github.com/awslabs/smithy-vscode/pull/55)
- Allow setting the root path to be used by the extension [#54](https://github.com/awslabs/smithy-vscode/pull/54)
- Update tests to use version 1.25.0 for Smithy packages [#56](https://github.com/awslabs/smithy-vscode/pull/56)

### 0.5.0 - 2022-08-29

- Updated to use [Smithy Language Server 0.2.0](https://github.com/awslabs/smithy-language-server/) which adds support for
hover action and Smithy IDL 2 syntax. [#52](https://github.com/awslabs/smithy-vscode/pull/52)
- Added a new file icon for `*.smithy` files. [#51](https://github.com/awslabs/smithy-vscode/pull/51)

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
