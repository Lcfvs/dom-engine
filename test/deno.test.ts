import { serialize, source } from '../lib/backend.ts';

const pTemplate = {
    [source]: '<p class="{?classes}">{salutations} {?name}</p>',
    classes: null,
    salutations: null,
    name: null
}

console.log(await serialize({...pTemplate, salutations: 'hello' }));