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
import tensePluginRules from 'commitlint-plugin-tense';
import message from '@commitlint/message';
import * as ensure from '@commitlint/ensure';


// The "subject tense" checker uses an allowlist to determine which verbs are allowed.
// The default allowlist is here:
// https://github.com/actuallydamo/commitlint-plugin-tense/blob/main/src/library/allowlist.ts
// We additionally allow the following verbs (added based on historical commits):
const ALLOWED_IMPERATIVE_VERBS = [
    "compress",
    "inject",
    "pessimize",
    "render"
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
const subjectComponentEmpty = async (parsed, when = 'always') => {
    const negated = when === 'never';
    const notEmpty = ensure.notEmpty(parsed.component || '');

    return [
        negated ? notEmpty : !notEmpty,
        message(['subject', negated ? 'must' : 'may not', 'be of the form <component>: <description>']),
    ];
}

const subjectDescriptionEmpty = async (parsed, when = 'always') => {
    const negated = when === 'never';
    const notEmpty = ensure.notEmpty(parsed.description || '');

    return [
        negated ? notEmpty : !notEmpty,
        message(['subject', negated ? 'must' : 'may not', 'be of the form <component>: <description>']),
    ];
}

// The subject tense plugin has two problems for us:
// * It is implemented using an allowlist that is all lowercase, so it falsely flags on case mismatches
// * We only want to apply it to the <description>
const subjectTense = async (parsed, when = 'always', value) => {
    const copiedParsed = structuredClone(parsed);
    copiedParsed.subject = (copiedParsed.description || '').toLowerCase();

    return tensePluginRules.rules['tense/subject-tense'](copiedParsed, when, value);
}


// =^.^=  =^.^=  =^.^=  =^.^=  =^.^=  =^.^=  =^.^=  =^.^=  =^.^=  =^.^=  =^.^=  =^.^=  =^.^=  =^.^= 
// Config

export default {
    plugins: [
        {
            rules: {
                'custom-subject-case': customSubjectCaseRule,
                'subject-component-empty': subjectComponentEmpty,
                'subject-description-empty': subjectDescriptionEmpty,
                'custom-subject-tense': subjectTense,
            }
        }
    ],
    rules: {
        'header-max-length': [RuleConfigSeverity.Error, 'always', 72],
        'header-trim': [RuleConfigSeverity.Error, 'always'], // No leading/trailing whitespace in subject
        'subject-empty': [RuleConfigSeverity.Error, 'never'], // No empty subject
        'subject-component-empty': [RuleConfigSeverity.Error, 'never'],
        'subject-description-empty': [RuleConfigSeverity.Error, 'never'],
        'custom-subject-case': [
            RuleConfigSeverity.Error,
            'never',
            ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
        'subject-full-stop': [RuleConfigSeverity.Error, 'never'], // No full-stop at end of subject
        'body-max-line-length': [RuleConfigSeverity.Error, 'always', 72],
        'body-leading-blank': [RuleConfigSeverity.Error, 'always'], // Empty line before body
        'custom-subject-tense': [RuleConfigSeverity.Error, 'always', { // Require present-imperative tense for first verb
            allowedTenses: ['present-imperative'],
            firstOnly: true,
            allowlist: ALLOWED_IMPERATIVE_VERBS,
        }],
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
