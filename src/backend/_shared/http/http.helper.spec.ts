import { getRealResponse } from "./http.helper";

describe('helper functions', () => {

    describe('getRealResponse', () => {
        it('should return response correct formatted', () => {
            const input = {
                msg: `
                    xxx
                    yyy
                    `
            }
            const output = `xxx\r
yyy\r
\r
`;
            const result = getRealResponse(input.msg);
            expect(result).toEqual(output); 
        });
    });
});