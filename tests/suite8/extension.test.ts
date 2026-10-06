import { serverUnavailableTests } from '../server-unavailable';

// The fixture sets smithy.server.executable to a path that doesn't exist, so the client fails to start.
suite('Server start failure', function () {
    this.timeout(0);
    serverUnavailableTests('suite8');
});
