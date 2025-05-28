import { getHttpItem, getHttpStatus, splitLine, transformKey } from "./http";
import * as cmd from "../cmd/cmd";
import { HTTP_OBJECT, MOCKED_URLS } from "./http.mocks";
import { getMockedResponse, MOCKED_RESPONSES } from "./http.helper";

describe('get status items', () => {

    describe('transformKey', () => {
        it('should transform key', () => {
            expect(transformKey('HTTP/1.1')).toEqual('http/1.1');
            expect(transformKey('Location')).toEqual('location');
            expect(transformKey('location')).toEqual('location');
            expect(transformKey('Content-Type')).toEqual('contentType');
            expect(transformKey('content-type')).toEqual('contentType');
            expect(transformKey('X-Frame-Options')).toEqual('xFrameOptions');
        });
    });
    describe('split lines', () => {
        describe('split line with colon', () => {
            expect(splitLine('KEY: value')).toEqual({ key: 'KEY', value: 'value'});
            expect(splitLine('KEY: multiple value')).toEqual({ key: 'KEY', value: 'multiple value'});
            expect(splitLine('KEY: multiple: value')).toEqual({ key: 'KEY', value: 'multiple: value'});
            
            expect(splitLine('KEY-XX: value')).toEqual({ key: 'KEY-XX', value: 'value'});
            expect(splitLine('KEY-XX: multiple value')).toEqual({ key: 'KEY-XX', value: 'multiple value'});
            expect(splitLine('KEY-XX: multiple: value')).toEqual({ key: 'KEY-XX', value: 'multiple: value'});
    
        });
        describe('split line without colon', () => {
            expect(splitLine('KEY value')).toEqual({ key: 'KEY', value: 'value'});
            expect(splitLine('KEY multiple value')).toEqual({ key: 'KEY', value: 'multiple value'});
            expect(splitLine('KEY multiple: value')).toEqual({ key: 'KEY', value: 'multiple: value'});
            
            expect(splitLine('KEY-XX value')).toEqual({ key: 'KEY-XX', value: 'value'});
            expect(splitLine('KEY-XX multiple value')).toEqual({ key: 'KEY-XX', value: 'multiple value'});
    
            // colon after first space
            expect(splitLine('KEY-XX multiple: value')).toEqual({ key: 'KEY-XX', value: 'multiple: value'});
        });
    });
    describe('get key/value item', () => {
        it('should result a 200', () => {
            expect(getHttpItem(MOCKED_RESPONSES.HTTP_200_FORWARD_1.step1)).toEqual(HTTP_OBJECT.HTTP_301);
            expect(getHttpItem(MOCKED_RESPONSES.HTTP_200_FORWARD_1.step2)).toEqual(HTTP_OBJECT.HTTP_200);
            expect(getHttpItem(MOCKED_RESPONSES.HTTP_404_FORWARD.step3)).toEqual(HTTP_OBJECT.HTTP_404);
        });
    })

});
describe('http status', () => {
    describe('get httpStatus', () => {
        let mockCommand: jest.SpyInstance;
        beforeEach(() => {
            mockCommand = jest.spyOn(cmd, 'command').mockImplementation(getMockedResponse);
        });
        afterEach(() => {
            mockCommand.mockRestore();
        })
        describe('get next step response', () => {
            it('return 0', () => {
                expect(getHttpStatus(MOCKED_URLS.HTTP_UNKOWN.step1)).toEqual('0');
            });
            it('return 200', () => {
                expect(getHttpStatus(MOCKED_URLS.HTTP_200_FORWARD_1.step2)).toEqual('200');
                expect(getHttpStatus(MOCKED_URLS.HTTP_200.step1)).toEqual('200');
            });
            it('return 301', () => {
                expect(getHttpStatus(MOCKED_URLS.HTTP_200_FORWARD_1.step1)).toEqual('301');
            });
            it('return 404', () => {
                expect(getHttpStatus(MOCKED_URLS.HTTP_404_FORWARD.step1)).toEqual('301');
                expect(getHttpStatus(MOCKED_URLS.HTTP_404_FORWARD.step2)).toEqual('301');
                expect(getHttpStatus(MOCKED_URLS.HTTP_404_FORWARD.step3)).toEqual('404');
                expect(getHttpStatus(MOCKED_URLS.HTTP_404.step1)).toEqual('404');
            });
            
        });
        describe('get last step response', () => {
            it('return 0', () => {
                expect(getHttpStatus(MOCKED_URLS.HTTP_404_FORWARD_MAX.step1, true)).toEqual('0');
            });
            it('return 200', () => {
                expect(getHttpStatus(MOCKED_URLS.HTTP_200_FORWARD_1.step1, true)).toEqual('200');
                expect(getHttpStatus(MOCKED_URLS.HTTP_200_FORWARD_2.step1, true)).toEqual('200');
            });
            it('return 404', () => {
                expect(getHttpStatus(MOCKED_URLS.HTTP_404_FORWARD.step1, true)).toEqual('404');
                expect(getHttpStatus(MOCKED_URLS.HTTP_404_FORWARD_MAX.step1, true)).toEqual('0');
                expect(getHttpStatus(MOCKED_URLS.HTTP_200_FORWARD_1.step1, true)).toEqual('200');
                expect(getHttpStatus(MOCKED_URLS.HTTP_200_FORWARD_2.step1, true)).toEqual('200');
            });
        });
    });
});