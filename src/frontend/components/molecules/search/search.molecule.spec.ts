import { getHighlightedText } from "./search.molecule";

describe('results', () => {

    it('should split the result with a highlighting', () => {
        expect(getHighlightedText('my custom text', '')).toEqual('my custom text');
        expect(getHighlightedText('my custom text', 'cust')).toEqual('my <span class="search-match">cust</span>om text');
        expect(getHighlightedText('my custom text', 'CUST')).toEqual('my <span class="search-match">cust</span>om text');
        expect(getHighlightedText('my custom text of custom text', 'cust')).toEqual('my <span class="search-match">cust</span>om text of <span class="search-match">cust</span>om text');
    });
});