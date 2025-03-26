import { vi } from 'vitest';

export function setUpMockFetch() {
  vi.spyOn(global, 'fetch').mockImplementation(mockFetch);
}

function mockResponse(url: string) {
  if (/BAD/.test(url)) {
    throw new Error('mocked server error');
  } else if (/smallzone.*GetServerInfo/.test(url)) {
    return [{ langs: 'it', nativeLang: 'it' }];
  } else if (/GetServerInfo/.test(url)) {
    return [{ langs: 'en,es,de', nativeLang: 'en' }];
  } else if (/GetServiceBodies/.test(url)) {
    return [
      { name: 'Big Zone', id: 5 },
      { name: 'Northern Region', id: 8 },
      { name: 'Southern Region', id: 9 }
    ];
  } else if (/GetFieldKeys/.test(url)) {
    // the examples with weird characters are for testing URL encoding
    return [
      { key: 'service_body_bigint', description: 'Service Body ID' },
      { key: 'location_province', description: 'State' },
      { key: 'weird&key', description: 'Key with & in it' }
    ];
  } else if (/GetFieldValues&meeting_key=location_province/.test(url)) {
    return [
        { location_province: 'WA', ids: '10,20,30' },
        { location_province: 'OR', ids: '44,55,60' }
      ];
} else if (/GetFieldValues&meeting_key=weird%26key/.test(url)) {
    return [
        { 'weird&key': 'a[3]', ids: '10,20,30' },
        { 'weird&key': 'b[4]', ids: '44,55,60' }
      ];
  } else if (/GetFormats/.test(url)) {
    return [
        { key_string: 'VM', id: '5' },
        { key_string: 'Ag', id: '8' },
        { key_string: 'LGBT', id: '3' }
    ];
  } else {
    throw new Error('Internal error: no mocked response for this request' + url);
  }
}

// hack around the type system -- what we want is something like this:
//     function mockFetch(url: string): Promise<Response>
function mockFetch(url: any): any {
  return Promise.resolve({
    json: () => Promise.resolve(mockResponse(url))
  });
}
