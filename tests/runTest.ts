import { resolve } from "path";

import { runTests } from "@vscode/test-electron";

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

    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath: resolve(__dirname, "./suite3"),
      launchArgs: [resolve(__dirname, "../../test-fixtures/suite3")],
    });
  } catch (err) {
    console.error("Failed to run tests");
    console.log(err);
    process.exit(1);
  }
}

go();
