module.exports = {
    setupFiles: [
        "<rootDir>/config.ts"
    ],
    transform: {
        ".(ts|tsx)": [
            "ts-jest",
            {
                "compiler": "ts-patch/compiler",
                "tsconfig": "tsconfig.test.json"
            }
        ]
    },
    testRegex: "(/src/.*|\\.(test|spec))\\.(ts|tsx)$",
    moduleFileExtensions: [
        "ts",
        "tsx",
        "js",
        "json"
    ],
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1"
    }
};
