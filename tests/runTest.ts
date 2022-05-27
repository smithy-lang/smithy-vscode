import { spawnSync } from "child_process";
import { resolve } from "path";

import {
  runTests,
  downloadAndUnzipVSCode,
  resolveCliPathFromVSCodeExecutablePath,
  resolveCliArgsFromVSCodeExecutablePath,
} from "@vscode/test-electron";
import * as assert from "assert";

async function go() {
  try {
    const extensionDevelopmentPath = resolve(__dirname, "../../");

    // Suite 1 - Extension registration and launching language server
    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath: resolve(__dirname, "./suite1"),
      launchArgs: [resolve(__dirname, "../../test-fixtures/suite1")],
    });

    // Suite 2 - Diagnostics from broken model
    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath: resolve(__dirname, "./suite2"),
      launchArgs: [resolve(__dirname, "../../test-fixtures/suite2")],
    });

    // Suite 3 - Selector commands
    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath: resolve(__dirname, "./suite3"),
      launchArgs: [resolve(__dirname, "../../test-fixtures/suite3")],
    });

    // Confirm that webpacked and vsce packaged extension can be installed.
    const vscodeExecutablePath = await downloadAndUnzipVSCode();
    const [cli, ...args] = resolveCliArgsFromVSCodeExecutablePath(vscodeExecutablePath);

    const result = spawnSync(cli, [...args, "--install-extension", "smithy-vscode.vsix"], {
      encoding: "utf-8",
    });
    assert.equal(result.status, 0);
    assert.match(result.stdout, /Extension 'smithy-vscode.vsix' was successfully installed./);
  } catch (err) {
    console.error("Test Failure");
    console.log(err);
    process.exit(1);
  }
}

go();
