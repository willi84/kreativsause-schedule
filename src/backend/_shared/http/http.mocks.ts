import { HTTP_OBJECTS } from "../../index.d";

const DOMAIN_1 = 'domain-1.de';
const DOMAIN_2 = 'domain-2.de';
const DOMAIN_3 = 'robert.berlin';
const DOMAIN_4 = 'aloha.com';
const DOMAIN_5 = 'lorem.org';
const DOMAIN_6 = 'blubb.de';

const DATE = 'Fri, 29 Mar 2024 21:28:51 GMT';
const LAST_MODIFIED = 'Mon, 18 Mar 2024 08:34:52 GMT';
const SERVER = {
    BASE: `
        Server: nginx/1.14.1
        Content-Type: text/html
        Connection: keep-alive`,
    EXTENDED: `
        Server: nginx/1.14.1
        Content-Type: text/html
        Connection: keep-alive
        X-Frame-Options: SAMEORIGIN
        Strict-Transport-Security: max-age=31536000;
        Referrer-Policy: no-referrer-when-downgrade`,
}
const STATUS = {
    HTTP_301: `
        HTTP/1.1 301 Moved Permanently
        Date: ${DATE}
        Content-Length: 185
        ${SERVER.EXTENDED}`,
    HTTP_200: `
        HTTP/1.1 200 OK
        Date: ${DATE}
        Last-Modified: ${LAST_MODIFIED}
        Content-Length: 76980
        ETag: "65f7fcac-12cb4"
        Accept-Ranges: bytes
        ${SERVER.EXTENDED}`,
    HTTP_404: `
        HTTP/1.1 404 Not Found
        Date: ${DATE}
        Content-Length: 41739
        ETag: "6595577a-a30b"
        ${SERVER.BASE}`
}


export const MOCKED_URLS = {
    HTTP_UNKOWN: {
        step1: 'https://wifi.inflightinternet.com'
    },
    HTTP_200: {
        step1: `https://www.${DOMAIN_1}/`
    },
    HTTP_200_FORWARD_1: {
        step1: `${DOMAIN_2}`,
        step2: `https://www.${DOMAIN_2}/`,
    },
    HTTP_200_FORWARD_2: {
        step1: `${DOMAIN_3}`,
        step2: `https://${DOMAIN_3}/`,
    },
    HTTP_404: {
        step1: `https://www.${DOMAIN_4}/xx/`
    },
    HTTP_404_FORWARD: {
        step1: `${DOMAIN_5}/xx`,
        step2: `https://www.${DOMAIN_5}/xx`,
        step3: `https://www.${DOMAIN_5}/xx/`,
    },
    HTTP_404_FORWARD_MAX: {
        step1: `${DOMAIN_6}/xx`,
        step2: `${DOMAIN_6}/xx/`,
        step3: `http://${DOMAIN_6}/xx/`,
        step4: `https://${DOMAIN_6}/xx/`,
        step5: `https://www.${DOMAIN_6}/xx/`,
        step6: `https://www.${DOMAIN_6.replace('.de', '.com')}/xx/`
    }
}


export const HTTP_OBJECT: HTTP_OBJECTS = {
    HTTP_301: {
        'status': '301',
        'statusMessage': 'Moved Permanently',
        'protocol': 'http',
        'protocolVersion': '1.1',
        'http/1.1': '301 Moved Permanently',
        'server': 'nginx/1.14.1',
        'date': DATE,
        'contentType': 'text/html',
        'contentLength': '185',
        'connection': 'keep-alive',
        'location': `https://www.${DOMAIN_2}/`,
        'xFrameOptions': 'SAMEORIGIN',
        'strictTransportSecurity': 'max-age=31536000;',
        'referrerPolicy': 'no-referrer-when-downgrade'
    },
    HTTP_200: {
        'status': '200',
        'statusMessage': 'OK',
        'protocol': 'http',
        'protocolVersion': '1.1',
        'http/1.1': '200 OK',
        'server': 'nginx/1.14.1',
        'date': DATE,
        'contentType': 'text/html',
        'contentLength': '76980',
        'lastModified': LAST_MODIFIED,
        'connection': 'keep-alive',
        'etag': '"65f7fcac-12cb4"',
        'xFrameOptions': 'SAMEORIGIN',
        'strictTransportSecurity': 'max-age=31536000;',
        'referrerPolicy': 'no-referrer-when-downgrade',
        'acceptRanges': 'bytes'
    },
    HTTP_404: {
        'status': '404',
        'statusMessage': 'Not Found',
        'protocol': 'http',
        'protocolVersion': '1.1',
        'http/1.1': '404 Not Found',
        'server': 'nginx/1.14.1',
        'date': DATE,
        'contentType': 'text/html',
        'contentLength': '41739',
        'connection': 'keep-alive',
        'etag': '"6595577a-a30b"'
    },
}

export const MOCKED_HTTP_STATUS = {
    HTTP_UNKNOWN: {
        step1: `curl: (6) Could not resolve host: wifi.inflightinternet.com`,
    },
    HTTP_200: {
        step1: `
            ${STATUS.HTTP_200}
        `,
    },
    HTTP_200_FORWARD_1: {
        step1: `
            ${STATUS.HTTP_301}
            Location: https://www.${DOMAIN_2}/
        `,
        step2: `
            ${STATUS.HTTP_200}
        `,
    },
    HTTP_404: {
        step1: `
            ${STATUS.HTTP_404}
        `,
    },
    HTTP_404_FORWARD: {
        step1: `
            ${STATUS.HTTP_301}
            Location: https://www.${DOMAIN_5}/xx
        `,
        step2: `
            ${STATUS.HTTP_301}
            Location: https://www.${DOMAIN_5}/xx/
        `,
        step3: `
            ${STATUS.HTTP_404}
        `,
    },
    HTTP_404_FORWARD_MAX: {
        step1: `
            ${STATUS.HTTP_301}
            Location: ${DOMAIN_6}/xx/
        `,
        step2: `
            ${STATUS.HTTP_301}
            Location: http://${DOMAIN_6}/xx/
        `,
        step3: `
            ${STATUS.HTTP_301}
            Location: https://${DOMAIN_6}/xx/
        `,
        step4: `
            ${STATUS.HTTP_301}
            Location: https://www.${DOMAIN_6}/xx/
        `,
        step5: `
            ${STATUS.HTTP_301}
            Location: https://www.${DOMAIN_6}/xx/
        `,
        step6: `
            ${STATUS.HTTP_404}
        `,
    },
    
    HTTP_200_FORWARD_2: {
        step1: `
            HTTP/1.0 308 Permanent Redirect
            Content-Type: text/plain
            Location: https://${DOMAIN_3}/
            Refresh: 0;url=https://${DOMAIN_3}/
            server: Vercel
        `,
        step2: `
            HTTP/2 200
            date: ${DATE}
            accept-ranges: bytes
            access-control-allow-origin: *
            age: 5626037
            cache-control: public, max-age=0, must-revalidate
            content-disposition: inline
            content-type: text/html; charset=utf-8
            etag: "2e6ccb0b0403aeb5796556f41b04c0fc"
            server: Vercel
            strict-transport-security: max-age=63072000
            x-vercel-cache: HIT
            x-vercel-id: fra1::296pw-1711747937798-0d4aec759f9a
            content-length: 1900
        `,
    }
}

export const HTTP_UNKNOWN = `curl: (28) Connection timed out after 2000 milliseconds`;