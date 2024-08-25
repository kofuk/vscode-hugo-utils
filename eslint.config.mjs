import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

export default [
    {
        plugins: {
            '@typescript-eslint': typescript
        },
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            parser: typescriptParser
        },
    },
    {
        files: ['**/*.ts'],
        ignores: ['out', 'dist', '**/*.d.ts'],
        rules: {
            '@typescript-eslint/naming-convention': [
                "warn",
                {
                    'selector': 'import',
                    'format': ['camelCase', 'PascalCase']
                }
            ],
            'curly': 'warn',
            'eqeqeq': 'warn',
            'no-throw-literal': 'warn'
        }
    }
];
