module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:react/recommended",
        "plugin:react-hooks/recommended",
    ],
    "overrides": [
        {
            "env": {
                "node": true
            },
            "files": [
                ".eslintrc.{js,cjs}"
            ],
            "parserOptions": {
                "sourceType": "script"
            }
        }
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "plugins": [
        "@typescript-eslint",
        "react",
        "react-refresh"
    ],
    "rules": {
        "react/react-in-jsx-scope": "off",
        indent: ["error", 2],
        "linebreak-style": ["error", "unix"],
        quotes: ["error", "double"],
        semi: ["error", "always"],
        "no-shadow": "off",
        "@typescript-eslint/no-shadow": ["error"],
        "import/extensions": "off",
        "@typescript-eslint/no-unused-vars": ["warn"],
        "no-console": ["error", { allow: ["warn", "error", "info", "table"] }],
        "import/prefer-default-export": "off",
        "import/no-unresolved": "off",
        "no-plusplus": "off",
        "class-methods-use-this": "off",
        "no-await-in-loop": "off",
        "consistent-return": "off",
        "import/no-extraneous-dependencies": "off",
        camelcase: "off",
        "no-trailing-spaces": ["error"],
        "object-curly-spacing": ["error", "always"],
    }
};
