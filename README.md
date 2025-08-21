# Smithy for VS Code

Provides support for the [Smithy interface definition language][smithy].

## Features

- Syntax highlighting of `.smithy` files
- Snippets
- Completions, jump to definition, and more, powered by [smithy-language-server][smithy-language-server]

## Configuration

You can configure the extension using [VSCode's settings][vscode-settings]. The
following settings are supported:

| Setting                                   | Description                                                                                                                                                                                                                                    |
|-------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| smithy.maxNumberOfProblems                | Controls the maximum number of problems produced by the server.<br/>Default: `100`                                                                                                                                                             |
| smithy.trace.server                       | Traces the communication between VS Code and smithy-language-server.<br/>Options: `"off"`, `"messages"`, `"verbose"`<br/>Default: `"verbose"`                                                                                                  |
| smithy.server.executable                  | Executable to run smithy-language-server, instead of the one managed by the extension. Can be the executable name if it is on your PATH, or an absolute path to the executable. If `null`, the extension will download it.<br/>Default: `null` |
| smithy.server.version                     | Version of smithy-language-server to use. Ignored if `smithy.server.executable` is provided.                                                                                                                                                   |
| smithy.server.diagnostics.minimumSeverity | Minimum severity of Smithy validation events to display in the editor.<br/>Options: `"NOTE"`, `"WARNING"`, `"DANGER"`, `"ERROR"`<br/>Default: `"WARNING"`                                                                                      |`

## Installation

You can install the extension from the [VS Code Extension Marketplace][marketplace],
or [from source](#build-from-source).

### Build from source

To install from source, first clone the repo:

```shell
git clone https://github.com/smithy-lang/smithy-vscode.git
cd smithy-vscode
```

Install the extension's dependencies:

```shell
npm install
```

Install the extension:

```shell
npm run install-plugin
```

This will overwrite any existing installation of the extension with the locally
built one.

## License

This project is licensed under the Apache-2.0 License.

[smithy]: https://smithy.io
[snippets]: https://code.visualstudio.com/docs/editor/userdefinedsnippets
[marketplace]: https://marketplace.visualstudio.com/items?itemName=smithy.smithy-vscode-extension
[smithy-language-server]: https://github.com/smithy-lang/smithy-language-server.git
[vscode-settings]: https://code.visualstudio.com/docs/configure/settings
