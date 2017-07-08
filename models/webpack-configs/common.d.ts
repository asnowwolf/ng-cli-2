import { NamedLazyChunksWebpackPlugin } from '../../plugins/named-lazy-chunks-webpack-plugin';
import { WebpackConfigOptions } from '../webpack-config';
/**
 * Enumerate loaders and their dependencies from this file to let the dependency validator
 * know they are used.
 *
 * require('source-map-loader')
 * require('raw-loader')
 * require('script-loader')
 * require('html-loader')
 * require('markup-inline-loader')
 * require('markdown-loader')
 * require('json-loader')
 * require('url-loader')
 * require('file-loader')
 */
export declare function getCommonConfig(wco: WebpackConfigOptions): {
    resolve: {
        extensions: string[];
        modules: string[];
        symlinks: boolean;
    };
    resolveLoader: {
        modules: string[];
    };
    context: string;
    entry: {
        [key: string]: string[];
    };
    output: {
        path: string;
        publicPath: string;
        filename: string;
        chunkFilename: string;
    };
    module: {
        rules: ({
            enforce: string;
            test: RegExp;
            loader: string;
            exclude: string[];
        } | {
            test: RegExp;
            loader: string;
        } | {
            test: RegExp;
            loaders: string[];
        })[];
    };
    plugins: NamedLazyChunksWebpackPlugin[];
    node: {
        fs: string;
        global: boolean;
        crypto: string;
        tls: string;
        net: string;
        process: boolean;
        module: boolean;
        clearImmediate: boolean;
        setImmediate: boolean;
    };
};
