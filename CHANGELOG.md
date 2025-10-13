# Smithy VSCode Extension Changelog

## 0.9.1 (2025-10-13)

- Fixed bug where language server could not load [#115](https://github.com/smithy-lang/smithy-vscode/pull/114)

## 0.9.0 (2025-04-16)

- Added setting to run the smithy-language-server using a specific executable [#106](https://github.com/smithy-lang/smithy-vscode/pull/106)
- Changed name of settings to `smithy.*` and deprecated old settings [#106](https://github.com/smithy-lang/smithy-vscode/pull/106)
- Added syntax highlighting for hovering on members [#107](https://github.com/smithy-lang/smithy-vscode/pull/107)
- Updated smithy-language-server version to 0.7.0 [#108](https://github.com/smithy-lang/smithy-vscode/pull/108)

## 0.8.0 (2025-03-10)

- Updated smithy-language-server version to 0.6.0 [#103](https://github.com/smithy-lang/smithy-vscode/pull/103)
- Use language server for smithy-build.json support [#102](https://github.com/smithy-lang/smithy-vscode/pull/102)

## 0.7.0 (2024-11-26)

- Updated smithy-language-server version to 0.5.0 [#97](https://github.com/smithy-lang/smithy-vscode/pull/97)
- Extension now starts when any Smithy files are found in the workspace [#96](https://github.com/smithy-lang/smithy-vscode/pull/96)

## 0.6.1 (2024-09-09)

- Updated smithy-language-server version to 0.4.1 [#94](https://github.com/smithy-lang/smithy-vscode/pull/94)

## 0.6.0 (2024-08-02)

- Updated smithy-language-server version to 0.4.0 [#89](https://github.com/smithy-lang/smithy-vscode/pull/89)
- Removed configuration for .smithy.lsp.log file [#89](https://github.com/smithy-lang/smithy-vscode/pull/89)
- Added configuration option for model validation minimum severity [#89](https://github.com/smithy-lang/smithy-vscode/pull/89)
- Added configuration option for only reloading the model on save [#89](https://github.com/smithy-lang/smithy-vscode/pull/89)

## 0.5.4 (2023-11-09)

- Added configuration for LspLog file. [#82](https://github.com/smithy-lang/smithy-vscode/pull/82)
- Added `smithy-build.json` JSON Schema. [#76](https://github.com/smithy-lang/smithy-vscode/pull/76)
- Fixed grammar for `apply` statement. [#76](https://github.com/smithy-lang/smithy-vscode/pull/75)

## 0.5.3 (2023-03-17)

- Added model formatting via Smithy Language Server 0.2.3. [#67](https://github.com/awslabs/smithy-vscode/pull/67)

## 0.5.2 (2022-12-27)

- Updated to use [Smithy Language Server 0.2.2](https://github.com/awslabs/smithy-language-server/).

## 0.5.1 (2022-09-29)

- Updated to use [Smithy Language Server 0.2.1](https://github.com/awslabs/smithy-language-server/).
- Stopped switching focus to VSCode's output window when the extension receives a message. [#55](https://github.com/awslabs/smithy-vscode/pull/55)
- Allowed setting the root path to be used by the extension. [#54](https://github.com/awslabs/smithy-vscode/pull/54)
- Updated tests to use version 1.25.0 for Smithy packages. [#56](https://github.com/awslabs/smithy-vscode/pull/56)

## 0.5.0 (2022-08-29)

- Updated to use [Smithy Language Server 0.2.0](https://github.com/awslabs/smithy-language-server/) which adds support for
hover action and Smithy IDL 2 syntax. [#52](https://github.com/awslabs/smithy-vscode/pull/52)
- Added a new file icon for `*.smithy` files. [#51](https://github.com/awslabs/smithy-vscode/pull/51)

## 0.4.0 (2022-06-13)

- Updated to work with Smithy 2.0 syntax.
- Used [Smithy Language Server](https://github.com/awslabs/smithy-language-server/) for language features including:
auto-completion, jump to definition, model validations as diagnostics. [#32](https://github.com/awslabs/smithy-vscode/pull/32)
- Added `Smithy:Selector:Run` and `Smithy:Selector:Clear` commands for highlighting the results of running an
expression on the model in a workspace. [#33](https://github.com/awslabs/smithy-vscode/pull/33)

## 0.3.0 (2020-09-19)

- Updated to work with Smithy 1.0 syntax.

## 0.2.0 (2019-06-26)

- Add support for use statements.
- Add support for documentation comments.

## 0.1.0 (2019-05-06)

Initial release for Smithy IDL syntax highlighting.
