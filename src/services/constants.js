const ENV = import.meta.env.MODE || 'development';

const API_URLS = {
    development: 'http://localhost:5000/api/admin',
    production: 'https://api.yourgymcrm.com/api/admin',
    live: 'https://api.yourgymcrm.com/api/admin',
};

export const BASE_URL = API_URLS[ENV] || API_URLS.development;
