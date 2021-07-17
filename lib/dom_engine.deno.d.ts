export interface Data {
    // deno-lint-ignore no-explicit-any
    [key: string]: any
}

export interface Context {
    // deno-lint-ignore no-explicit-any
    document: any, parser: any, serializer: any;

    // deno-lint-ignore no-explicit-any
    policy?: any;

    source: symbol;
}