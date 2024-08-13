import {
    RuleConfigSeverity,
} from '@commitlint/types';

export default {
    plugins: ['commitlint-plugin-tense'],
    rules: {
        'header-max-length': [RuleConfigSeverity.Error, 'always', 72],
        'header-trim': [RuleConfigSeverity.Error, 'always'], // No leading/trailing whitespace in subject
        'subject-empty': [RuleConfigSeverity.Error, 'never'], // No empty subject
        'subject-case': [
            RuleConfigSeverity.Error,
            'never',
            ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
        'subject-full-stop': [RuleConfigSeverity.Error, 'never'], // No full-stop at end of subject
        'body-max-line-length': [RuleConfigSeverity.Error, 'always', 72],
        'body-leading-blank': [RuleConfigSeverity.Error, 'always'], // Empty line before body
        'footer-leading-blank': [RuleConfigSeverity.Error, 'always'], // Empty line before footer
        'footer-max-line-length': [RuleConfigSeverity.Error, 'always', 72],
        'tense/subject-tense': [RuleConfigSeverity.Error, 'always', { // Require present-imperative tense for first verb
            allowedTenses: ['present-imperative'],
            firstOnly: true,
            // Allow additional verbs not allowed by default
            allowlist: [
                "render"
            ],
        }],
    },
    ignores: [
        (message) => message.includes("Merge pull request #"), // PR merges are allowed
    ],
    parserPreset: {
        parserOpts: {
            headerPattern: /^((\w+):\s(.+))$/,
            headerCorrespondence: ['subject', 'component', 'description'],
            footerPattern: /^(\w+(-\w+)*):\s(.+)$/, // Allows footers like Signed-off-by
            footerCorrespondence: ['token', '_', 'value'],
        },
    }
}
