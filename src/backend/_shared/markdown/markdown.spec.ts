import { getUrl, getValue, readMDFile } from "./markdown";

// export {}


describe('markdown', () => {
  it('should read frontmatter', () => {
    const content = `---
name: tiny-helpers.dev
addedAt: "2023-09-08"
---`;
    const result = readMDFile(content);
    const metadata = [
        {key: 'name', value: 'tiny-helpers.dev'},
        {key: 'addedAt', value: '"2023-09-08"'} // TODO: should be a date
    ];
    expect(result).toEqual(metadata);

  });

});
describe('handle formats', () => {

  describe('extract urls', () => {
    it('should extract absolute urls within quotation marks', () => {
      expect(getUrl('"https://www.google.de"')).toEqual('https://www.google.de')
      expect(getUrl("'https://www.google.de'")).toEqual('https://www.google.de')
      expect(getUrl('https://www.google.de')).toEqual('https://www.google.de')
    });
    it('should remove spaces', () => {
      expect(getUrl('  https://www.google.de  ')).toEqual('https://www.google.de');
    });
    it('should remove unnesccessary comma', () => {
      expect(getUrl('https://www.google.de,')).toEqual('https://www.google.de');
      expect(getUrl('"https://www.google.de",')).toEqual('https://www.google.de')
      expect(getUrl("'https://www.google.de',")).toEqual('https://www.google.de')
    });
    it('should not remove trailing comma', () => {
      expect(getUrl('https://www.google.de?x,&foo=bar')).toEqual('https://www.google.de?x,&foo=bar');
    });
  })
});

describe('split key/value', () => {
  describe('get value', () => {

    it('get normal value', () => {
        expect(getValue('foo: bar')).toEqual('bar');
    });
    it('get value with colons', () => {
        expect(getValue('foo: ')).toEqual('');
        expect(getValue('foo: bar:blubb')).toEqual('bar:blubb');
        expect(getValue('foo: bar:blubb:')).toEqual('bar:blubb:');
        expect(getValue('foo: bar::blubb:')).toEqual('bar::blubb:');
    });
  });
});