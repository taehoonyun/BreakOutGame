const path = require('path');
module.exports = {
    devServer: {
        port: 3000,
    },
    style: {
        // postcss: {
        // },
    },
    webpack: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    jest: {
        configure: {
            moduleNameMapper: {
                '^@(.*)$': '<rootDir>/src$1',
            },
        },
    }
};
