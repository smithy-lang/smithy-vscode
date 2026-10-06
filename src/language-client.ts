import * as lsp from 'vscode-languageclient/node';

export const SERVER_NOT_RUNNING_MESSAGE =
    'Smithy Language Server is not running. Fix the error reported when it started, then reload the window.';

/**
 * Holds the language client, which is created asynchronously because resolving the server can involve
 * downloading Coursier. Commands are registered before the client exists, and use this to wait for it
 * or to find out that it is unavailable.
 */
export default class LanguageClientHandle {
    private client: lsp.LanguageClient | undefined;
    private setupFailed = false;
    private readonly settled: Promise<void>;
    private markSettled!: () => void;

    constructor() {
        this.settled = new Promise((resolve) => (this.markSettled = resolve));
    }

    /** The client, if it has been created. */
    get current(): lsp.LanguageClient | undefined {
        return this.client;
    }

    /**
     * Starts the client, which also launches the server. Resolves to false if the client fails to start.
     * The client itself reports start failures to the user.
     */
    async start(client: lsp.LanguageClient): Promise<boolean> {
        this.client = client;
        try {
            await client.start();
            return true;
        } catch {
            return false;
        } finally {
            this.markSettled();
        }
    }

    /** Marks the client as unavailable because the server could not be set up. */
    fail(): void {
        this.setupFailed = true;
        this.markSettled();
    }

    /** Whether the client is known to be unavailable, without waiting for setup to finish. */
    isUnavailable(): boolean {
        return this.setupFailed || this.client?.state === lsp.State.Stopped;
    }

    /** Waits for the server to be set up and started, then returns the client if it is running. */
    async get(): Promise<lsp.LanguageClient | undefined> {
        await this.settled;
        return this.client?.isRunning() ? this.client : undefined;
    }
}
