import { serverUnavailableTests } from '../server-unavailable';

// runTest.ts makes Coursier setup fail by putting a file where the extension's global storage directory goes.
suite('Server setup failure', function () {
    this.timeout(0);
    serverUnavailableTests('suite7');
});
