import { downloadCoursierIfRequired } from "./download-coursier";
import { findCoursierOnPath } from "./path-check";

export function getCoursierExecutable(extensionPath: string): Promise<string> {
  return findCoursierOnPath(extensionPath).then((paths) => {
    if (paths.length > 0) {
      return paths[0];
    } else {
      return downloadCoursierIfRequired(extensionPath, "v2.0.6");
    }
  });
}
