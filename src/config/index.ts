/* eslint-disable import/no-anonymous-default-export */
export default {
    api:
        process.env.NODE_ENV === 'production'
            ? {
                /* Production Server Setting */
                //   hostURL: 'http://localhost:4200',
                //   base: '/',
                //   baseURL: '/api',
                //   fileURL: '/file/',
                //   adminVersion: '1.0.1',
                /* Local Production Test */
                hostURL: 'http://localhost:5000',
                base: '/',
                baseURL: 'http://localhost:5000/api',
                fileURL: 'http://localhost:5000/file/',
                adminVersion: '1.0.1',
            }
            : {
                hostURL: 'http://localhost:5000',
                base: '/',
                baseURL: 'http://localhost:5000/api',
                fileURL: '/file/',
                adminVersion: '1.0.1',
            },
};
