export interface TestOptions {
    watch?: boolean;
    codeCoverage?: boolean;
    singleRun?: boolean;
    browsers?: string;
    colors?: boolean;
    log?: string;
    port?: number;
    reporters?: string;
    sourcemap?: boolean;
    progress?: boolean;
    config: string;
    poll?: number;
    app?: string;
}
declare const TestCommand: any;
export default TestCommand;
