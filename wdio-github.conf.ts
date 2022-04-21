import path from 'path';
import { config as buildConfig } from './wdio.conf';

buildConfig.capabilities = [{
    browserName: 'chrome',
    'goog:chromeOptions': {
        args: [
            '--disable-infobars',
            '--window-size=1280,800',
            '--headless',
            '--no-sandbox',
            '--disable-gpu',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
        ],
    },
}];

buildConfig.port = 9516;
buildConfig.services = [
    [
        'chromedriver',
        {
            chromeDriverArgs: ['--port=9516', '--url-base=\'/\''],
        },
    ],
];
buildConfig.path = '/';
export const config = buildConfig;
