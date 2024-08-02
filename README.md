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
    "version": "1.0",
    "maven": {
        "dependencies": ["software.amazon.smithy:smithy-aws-traits:1.40.0"],
        "repositories": [{ "url": "https://repo1.maven.org/maven2/" }]
    }
}
```
Start authoring your Smithy model. Opening a `*.smithy` file will activate
the extension.

## Use with any Maven private registry

Follow [these instructions](https://get-coursier.io/docs/other-credentials#property-file) to set the credentials file for your Maven private registry. Here is an example for a Maven registry provided by GitHub:
```
github.username=<ANY_USERNAME>
github.password=<YOUR_GITHUB_TOKEN>
github.host=maven.pkg.github.com
```

## Use with IntelliJ

You can use this extension for syntax highlighting in IntelliJ by installing the
"TextMate bundle support" plugin and registering this repository as a bundle.
See the [IntelliJ documentation](https://www.jetbrains.com/help/idea/textmate.html)
for more details.

## Release Notes

### 0.6.0 - 2024-08-02

- Updated smithy-language-server version to 0.4.0 [#89](https://github.com/smithy-lang/smithy-vscode/pull/89)
- Removed configuration for .smithy.lsp.log file [#89](https://github.com/smithy-lang/smithy-vscode/pull/89)
- Added configuration option for model validation minimum severity [#89](https://github.com/smithy-lang/smithy-vscode/pull/89)
- Added configuration option for only reloading the model on save [#89](https://github.com/smithy-lang/smithy-vscode/pull/89)

### 0.5.4 - 2023-11-09

- Added configuration for LspLog file. [#82](https://github.com/smithy-lang/smithy-vscode/pull/82)
- Added `smithy-build.json` JSON Schema. [#76](https://github.com/smithy-lang/smithy-vscode/pull/76)
- Fixed grammar for `apply` statement. [#76](https://github.com/smithy-lang/smithy-vscode/pull/75)

### 0.5.3 - 2023-03-17

- Added model formatting via Smithy Language Server 0.2.3. [#67](https://github.com/awslabs/smithy-vscode/pull/67)

### 0.5.2 - 2022-12-27

- Updated to use [Smithy Language Server 0.2.2](https://github.com/awslabs/smithy-language-server/).

### 0.5.1 - 2022-09-29

- Updated to use [Smithy Language Server 0.2.1](https://github.com/awslabs/smithy-language-server/).
- Stopped switching focus to VSCode's output window when the extension receives a message. [#55](https://github.com/awslabs/smithy-vscode/pull/55)
- Allowed setting the root path to be used by the extension. [#54](https://github.com/awslabs/smithy-vscode/pull/54)
- Updated tests to use version 1.25.0 for Smithy packages. [#56](https://github.com/awslabs/smithy-vscode/pull/56)

### 0.5.0 - 2022-08-29

- Updated to use [Smithy Language Server 0.2.0](https://github.com/awslabs/smithy-language-server/) which adds support for
hover action and Smithy IDL 2 syntax. [#52](https://github.com/awslabs/smithy-vscode/pull/52)
- Added a new file icon for `*.smithy` files. [#51](https://github.com/awslabs/smithy-vscode/pull/51)

### 0.4.0 - 2022-06-13

- Updated to work with Smithy 2.0 syntax.
- Used [Smithy Language Server](https://github.com/awslabs/smithy-language-server/) for language features including:
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
