module.exports = {
    DEFAULT_PORT: 8080,
    SESSION_SECRET: '',
    DB_NAME: '',
    DB_USER: '',
    DB_PASS: '',
    DB_HOST: 'localhost',
    DB_PORT: 3306,
    PASS_SALT: '',
    CAPTCHA_SITE_KEY: '',
    CAPTCHA_SECRET: '',
    ALERT_CODES: {
        'missing-data': 'ERROR - Missing or invalid data. Check your data and try again.',
        'invalid-credentials': 'ERROR - Invalid email or password. Check your data and try again',
        'invalid-data': 'ERROR - Invalid data',
        'terms': 'ERROR - You must read and accept terms of service and privacy policy to continue.',
        'invalid-captcha': 'ERROR - Invalid captcha.',
        'insufficient-funds': 'ERROR - You don\'t have enough money.',
        'something-wrong': 'ERROR - Something went wrong, try again later.',
        'success': 'SUCCESS - Action performed successfully!',
    }
};
