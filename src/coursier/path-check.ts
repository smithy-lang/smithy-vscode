import { spawn } from "child_process";

/**
 * This type is used to bypass the `defaultImpl` when running the tests.
 */
export type ExecForCode = {
  run: (execName: string, args: Array<string>, cwd: string) => Promise<number>;
};

const defaultImpl: ExecForCode = {
  run: (execName: string, args: Array<string>, cwd: string) => {
    return new Promise((resolve, reject) => {
      const options = { cwd };
      const resolveProcess = spawn(execName, args, options);
      resolveProcess.on("exit", (exitCode) => {
        resolve(exitCode);
      });
      resolveProcess.on("error", (err) => {
        reject(err);
      });
    });
  },
};

export function findCoursierOnPath(
  cwd: string,
  execForCode: ExecForCode = defaultImpl
): Promise<Array<string>> {
  function availableOnPath(execName: string): Promise<boolean> {
    return execForCode
      .run(execName, ["--help"], cwd)
      .then((ec) => ec === 0)
      .catch(() => false);
  }

  const possibleCoursierNames = ["cs", "coursier"];
  return possibleCoursierNames.reduce((accP, current) => {
    return accP.then((acc) => {
      return availableOnPath(current).then((succeeeded) => {
        return succeeeded ? [...acc, current] : acc;
      });
    });
  }, Promise.resolve([]));
}
