import {readFileSync, readdirSync} from 'fs';
import {join} from 'path';

const root = join(__dirname, '..');
const read = (file: string) => readFileSync(join(root, file), 'utf8');
const podspec = readdirSync(root).find(file => file.endsWith('.podspec')) as string;

describe('iOS SDK version', () => {
  it('is the same in the podspec and Package.swift', () => {
    const pods = [...read(podspec).matchAll(/s\.dependency "[^"]+", "([^"]+)"/g)].map(match => match[1]);
    const swift = read('Package.swift').match(/let iosSdkVersion = "([^"]+)"/)?.[1];

    expect(pods).toHaveLength(2);
    expect(pods[1]).toBe(pods[0]);
    expect(swift).toBe(pods[0]);
  });

  it('ships Package.swift in the npm package', () => {
    expect(JSON.parse(read('package.json')).files).toContain('Package.swift');
  });
});
