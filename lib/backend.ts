import jsdom from 'https://dev.jspm.io/jsdom';
import type {
    Data
} from './dom_engine.deno.d.ts';

const symbol = Symbol('source');

// deno-lint-ignore no-explicit-any
const { window } = new (jsdom as any).JSDOM('<!DOCTYPE html>')
const { document, DOMParser, XMLSerializer } = window

export const source = symbol;

export function template(src: string, {...data}: Data): Template {
    return ({
        [symbol]: src,
        ...data
    });
}

const ctx = {
    document,
    parser: new DOMParser(),
    serializer: new XMLSerializer(),
    source
};