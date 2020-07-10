import jsdom from 'jsdom'
import * as dom from './dom.js'

const window = new jsdom.JSDOM('<!DOCTYPE html>').window

export const template = dom.template.bind(dom, window)
export const serialize = dom.serialize
