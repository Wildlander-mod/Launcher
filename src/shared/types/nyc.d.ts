declare module "nyc/lib/source-maps" {
  import libCoverage from "istanbul-lib-coverage";

  interface SourceMapsOptions {
    cache?: boolean;
    cacheDirectory?: string;
  }

  interface SourceMapObject {
    version?: number;
    sources?: string[];
    names?: string[];
    mappings?: string;
    file?: string;
    sourceRoot?: string;
    sourcesContent?: string[];
  }

  class SourceMaps {
    cache: boolean;
    cacheDirectory: string;
    loadedMaps: Record<string, SourceMapObject | false>;
    private _sourceMapCache: unknown;

    constructor(opts: SourceMapsOptions);

    cachedPath(source: string, hash: string): string;
    purgeCache(): void;
    extract(code: string, filename: string): SourceMapObject | undefined;
    registerMap(
      filename: string,
      hash: string,
      sourceMap?: SourceMapObject
    ): void;
    remapCoverage(obj: unknown): Promise<libCoverage.CoverageMapData>;
    reloadCachedSourceMaps(report: unknown): Promise<void>;
  }

  export = SourceMaps;
}
