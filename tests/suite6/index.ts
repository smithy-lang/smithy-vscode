import { runTests } from "../helper";

export function run(testsRoot: string, cb: (error: any, failures?: number) => void): void {
  runTests(testsRoot, cb);
}
