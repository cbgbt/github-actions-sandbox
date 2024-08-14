/* Configuration [commitlint](https://github.com/conventional-changelog/commitlint)

Bottlerocket's preferred commit style fits the following template:

```
<component>: <description>     <- <subject> line

<body>
```

Where:
* The <subject> line is no longer than 72 characters (though shorter is better -- aim for 52.)
* The <component> briefly describes which subsystem was changed by the commit
  (e.g. kernel, k8s, docker)
* The <description> should prefer lower-case, and should not end in '.'
* The <description> uses the "present imperative" tense and briefly describes the change.
    * Tip: A properly formed git commit <description> should always be able to complete the
      following sentence: "If applied, this commit will __________"
* The <body> is optional, though it must be separated from the subject line by a newline if
  it is present.
    * The <body> may contain as many newline-separated paragraphs as desired.
    * Lines in the <body> are not longer than 72 characters.

* Good Examples:
  * shoestore: migrate shoes to new shoe module
  * dungeonmaster: improve STR and CON attributes
  * dog: refill water bowl

    This change introduces a new WaterBowl::add_water implementation that
    satisfies new dog bowl requirements.

* Bad Examples:
  * migrate shoes to new shoe module.
    * Missing <component>
    * Includes a fullstop (".")
  * dungeonmaster: Fixes a bug with STR and CON attributes
    * 'F' is capitalized
    * "Fixes" is incorrect tense (present but not imperative)
*/
import {
    RuleConfigSeverity,
} from '@commitlint/types';
import coreRules from '@commitlint/rules';
import message from '@commitlint/message';
import * as ensure from '@commitlint/ensure';


// To ensure appropriate tense for commit messages, we check the first word in the description
// against a verb allowlist.
//
// The allowlist is a copy (replicated below) of the allowlist from `commitlint-plugin-tense`
// (https://github.com/actuallydamo/commitlint-plugin-tense/blob/main/src/library/allowlist.ts)
//
// The `commitlint-plugin-tense` plugin would occassionally flag false-positives due to the NLP
// methodology it uses.
//
// We additionally allow the following verbs (based on historical commits):
//
// This list is by no means definitive -- please freely add verbs in the correct tense & mood!
const ALLOWED_IMPERATIVE_VERBS = [
    "accommodate",
    "archive",
    "auto-create",
    "backport",
    "backstop",
    "backtick",
    "box",
    "canonicalize",
    "cargo",
    "cherry-pick",
    "chill",
    "chmod",
    "choose",
    "compress",
    "conditionalize",
    "confine",
    "constrain",
    "consult",
    "deny",
    "derive",
    "destructure",
    "differentiate",
    "downgrade",
    "download",
    "drive",
    "elaborate",
    "encode",
    "execute",
    "express",
    "flip",
    "follow",
    "format",
    "genericize",
    "go",
    "inject",
    "install",
    "inventory",
    "isolate",
    "label",
    "label",
    "launch",
    "mention",
    "mitigate",
    "modularize",
    "mount",
    "normalize",
    "order",
    "organize",
    "output",
    "overhaul",
    "patch",
    "percent-encode",
    "persist",
    "pessimize",
    "pin",
    "plumb",
    "point",
    "polyfill",
    "prepend",
    "privatize",
    "quote",
    "raise",
    "re-create",
    "re-enable",
    "reap",
    "rebase",
    "recommend",
    "reconfigure",
    "redo",
    "refer",
    "render",
    "renumber",
    "repeat",
    "rerun",
    "restart",
    "retain",
    "scope",
    "secure",
    "sign",
    "solicit",
    "special-case",
    "strengthen",
    "stripe",
    "surface",
    "templatize",
    "tie",
    "translate",
    "truncate",
    "trust",
    "unmask",
    "unpin",
    "unset",
    "unwrap",
    "vend",
    "vendor",
    "widen",
];


// =^.^=  =^.^=  =^.^=  =^.^=  =^.^=  =^.^=  =^.^=  =^.^=  =^.^=  =^.^=  =^.^=  =^.^=  =^.^=  =^.^= 
// Custom rules

// The default subject-case rule in commitlint applies to the entire subject line.
//
// We define our own rule that only applies to the "description" subsection.
const customSubjectCaseRule = async (parsed, when = 'always', value = []) => {
    // We only care that the description follows the case rules
    const newParsed = {
        subject: parsed.description
    };

    return coreRules['subject-case'](newParsed, when, value);
};


// Our "headerPattern" accepts any input, even if they are missing a <component> or <description>.
//
// If the pattern were more strict, a parse failure would be shown to the user as having an
// "empty subject."
//
// Instead we check the work of our "lax" parser after the fact to give more precise error messages.
const componentEmpty = async (parsed, when = 'always') => {
    const negated = when === 'never';
    const notEmpty = ensure.notEmpty(parsed.component || '');

    return [
        negated ? notEmpty : !notEmpty,
        message(['subject', negated ? 'must' : 'may not', 'be of the form <component>: <description>']),
    ];
}

const descriptionEmpty = async (parsed, when = 'always') => {
    const negated = when === 'never';
    const notEmpty = ensure.notEmpty(parsed.description || '');

    return [
        negated ? notEmpty : !notEmpty,
        message(['subject', negated ? 'must' : 'may not', 'be of the form <component>: <description>']),
    ];
}

// The subject tense plugin uses NLP to identify verbs and occassionally creates false positives.
// Additionally:
// * It is implemented using an allowlist that is all lowercase, so it falsely flags on case mismatches
// * We only want to apply it to the <description>
//
// We'll just borrow the allowlist and skip the NLP
const descriptionPresentImperativeTense = async (parsed, when = 'always') => {
    const negated = when === 'never';

    const description = (parsed.description || '').toLowerCase().trim();
    const firstWord = description.split(' ')[0] || '';
    if (!firstWord) {
        return [true];
    }
    let allowlist = [...ALLOWED_IMPERATIVE_VERBS, ...COMMITLINT_PLUGIN_TENSE_ALLOWLIST];

    let allowed = allowlist.includes(firstWord)

    return [
        negated ? !allowed : allowed,
        message(['subject', negated ? 'may not' : 'must', 'use present imperative tense. disallowed word: ', firstWord]),
    ];
}


// =^.^=  =^.^=  =^.^=  =^.^=  =^.^=  =^.^=  =^.^=  =^.^=  =^.^=  =^.^=  =^.^=  =^.^=  =^.^=  =^.^= 
// Config

export default {
    plugins: [
        {
            rules: {
                'custom-subject-case': customSubjectCaseRule,
                'component-empty': componentEmpty,
                'description-empty': descriptionEmpty,
                'description-present-imperative-tense': descriptionPresentImperativeTense,
            }
        }
    ],
    rules: {
        'header-max-length': [RuleConfigSeverity.Error, 'always', 72],
        'header-trim': [RuleConfigSeverity.Error, 'always'], // No leading/trailing whitespace in subject
        'subject-empty': [RuleConfigSeverity.Error, 'never'], // No empty subject
        'component-empty': [RuleConfigSeverity.Error, 'never'],
        'description-empty': [RuleConfigSeverity.Error, 'never'],
        'description-present-imperative-tense': [RuleConfigSeverity.Error, 'always'], // Require present-imperative tense for first verb
        'custom-subject-case': [
            RuleConfigSeverity.Error,
            'never',
            ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
        'subject-full-stop': [RuleConfigSeverity.Error, 'never'], // No full-stop at end of subject
        'body-max-line-length': [RuleConfigSeverity.Error, 'always', 72],
        'body-leading-blank': [RuleConfigSeverity.Error, 'always'], // Empty line before body
    },
    ignores: [
        (message) => message.includes("Merge pull request #"), // PR merges are allowed
        (message) => /^bump [\w.-]+ to v?[\w.-]+$/.test(message.trim()), // "bump" commits are allowed
    ],
    parserPreset: {
        parserOpts: {
            headerPattern: /^((?:([\w._-]+):\s(.+))|.+)$/,
            headerCorrespondence: ['subject', 'component', 'description'],
        },
    }
}

// =^.^=  =^.^=  =^.^=  =^.^=  =^.^=  =^.^=  =^.^=  =^.^=  =^.^=  =^.^=  =^.^=  =^.^=  =^.^=  =^.^= 
// present-imperative verb tense allowlist from `commitlint-plugin-tense`:
// https://github.com/actuallydamo/commitlint-plugin-tense
//
// The allowlist itself is not exposed through public interfaces of the module,
// and so is copied here.

// MIT License
//
// Copyright (c) 2022 Damien Kingsley
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

const COMMITLINT_PLUGIN_TENSE_ALLOWLIST = [
    'abort',
    'absorb',
    'abstract',
    'accept',
    'access',
    'account',
    'acquire',
    'activate',
    'adapt',
    'add',
    'address',
    'adjust',
    'adopt',
    'advertise',
    'align',
    'allocate',
    'allow',
    'annotate',
    'append',
    'apply',
    'assert',
    'assign',
    'assume',
    'attach',
    'automatically',
    'avoid',
    'bail',
    'balance',
    'be',
    'beautify',
    'better',
    'bind',
    'block',
    'break',
    'bring',
    'build',
    'bump',
    'cache',
    'calculate',
    'call',
    'cancel',
    'capture',
    'cast',
    'catch',
    'centralise',
    'centralize',
    'change',
    'check',
    'clarify',
    'clean',
    'cleanup',
    'clear',
    'close',
    'code',
    'collapse',
    'collect',
    'combine',
    'comment',
    'compile',
    'complete',
    'compute',
    'conditionally',
    'configure',
    'consider',
    'consistently',
    'consolidate',
    'constify',
    'control',
    'convert',
    'copy',
    'correct',
    'count',
    'create',
    'deal',
    'debug',
    'declare',
    'decode',
    'decouple',
    'decrease',
    'deduplicate',
    'default',
    'defer',
    'define',
    'delay',
    'delete',
    'demote',
    'depend',
    'deprecate',
    'describe',
    'destroy',
    'detect',
    'determine',
    'disable',
    'disallow',
    'discard',
    'display',
    'distinguish',
    'do',
    'document',
    "don't",
    'double',
    'drop',
    'dump',
    'eliminate',
    'embed',
    'emit',
    'emulate',
    'enable',
    'encapsulate',
    'enforce',
    'enhance',
    'ensure',
    'error',
    'exclude',
    'exit',
    'expand',
    'explain',
    'export',
    'expose',
    'extend',
    'extract',
    'factor',
    'factorize',
    'fail',
    'fallback',
    'fetch',
    'fill',
    'filter',
    'find',
    'finish',
    'fix',
    'fixup',
    'flush',
    'fold',
    'forbid',
    'force',
    'free',
    'fully',
    'further',
    'generalize',
    'generate',
    'get',
    'give',
    'grab',
    'group',
    'guard',
    'handle',
    'have',
    'hide',
    'hold',
    'honor',
    'honour',
    'hook',
    'identify',
    'ignore',
    'implement',
    'improve',
    'include',
    'increase',
    'increment',
    'indicate',
    'init',
    'initial',
    'initialise',
    'initialize',
    'inline',
    'insert',
    'integrate',
    'introduce',
    'invalidate',
    'invert',
    'invoke',
    'issue',
    'keep',
    'kill',
    'leave',
    'let',
    'lift',
    'limit',
    'link',
    'load',
    'lock',
    'log',
    'look',
    'lower',
    'maintain',
    'make',
    'manage',
    'map',
    'mark',
    'mask',
    'match',
    'merge',
    'migrate',
    'modify',
    'move',
    'name',
    'notify',
    'nuke',
    'null',
    'omit',
    'on',
    'open',
    'optimise',
    'optimize',
    'override',
    'parse',
    'pass',
    'perform',
    'permit',
    'place',
    'platform',
    'plug',
    'poll',
    'populate',
    'port',
    'power',
    'prefer',
    'prefix',
    'prepare',
    'preserve',
    'prevent',
    'print',
    'probe',
    'process',
    'program',
    'propagate',
    'protect',
    'provide',
    'pull',
    'purge',
    'push',
    'put',
    'query',
    'queue',
    'quiet',
    'read',
    'rearrange',
    'record',
    'reduce',
    'refactor',
    'reference',
    'refine',
    'reformat',
    'refresh',
    'refuse',
    'register',
    'reimplement',
    'reject',
    'relax',
    'release',
    'relicense',
    'relocate',
    'rely',
    'remove',
    'rename',
    'reorder',
    'reorganise',
    'reorganize',
    'repair',
    'replace',
    'report',
    'request',
    'require',
    'reserve',
    'reset',
    'resolve',
    'respect',
    'restore',
    'restrict',
    'restructure',
    'retrieve',
    'retry',
    'return',
    'reuse',
    'revert',
    'revise',
    'rework',
    'rewrite',
    'rip',
    'round',
    'run',
    'sanitise',
    'sanitize',
    'save',
    'schedule',
    'select',
    'send',
    'separate',
    'serialise',
    'serialize',
    'set',
    'setup',
    'share',
    'shorten',
    'show',
    'shrink',
    'shut',
    'silence',
    'simplify',
    'skip',
    'sort',
    'specify',
    'speed',
    'split',
    'standardise',
    'standardize',
    'start',
    'staticise',
    'staticize',
    'stop',
    'store',
    'streamline',
    'style',
    'supply',
    'support',
    'suppress',
    'swap',
    'switch',
    'sync',
    'synchronise',
    'synchronize',
    'take',
    'teach',
    'tell',
    'test',
    'tidy',
    'tidyup',
    'tighten',
    'trace',
    'track',
    'treat',
    'trigger',
    'trim',
    'try',
    'tune',
    'turn',
    'tweak',
    'unbreak',
    'unconditionally',
    'unexport',
    'unify',
    'uninline',
    'unlock',
    'unmap',
    'unregister',
    'update',
    'upgrade',
    'use',
    'utilise',
    'utilize',
    'validate',
    'verify',
    'wait',
    'wake',
    'warn',
    'wire',
    'work',
    'workaround',
    'wrap',
    'write',
    'zero'
]
