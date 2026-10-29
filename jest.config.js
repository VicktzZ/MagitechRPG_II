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
        "^@/(.*)$": "<rootDir>/$1",
        // aliases do tsconfig ("@*": ["./*"]) que o jest não resolve sozinho
        "^@(components|themes|constants|enums|models|utils|hooks|contexts|layout|public|features|services|schemas|repositories|lib)(/(.*))?$": "<rootDir>/$1/$3"
    }
};
