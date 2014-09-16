var fetcher = require('../models-fetcher');

describe('model fetcher', function() {
  
  it('should get correct types', function() {
    
    expect(fetcher.types).toEqual({
      markdown:   'fs',
      mongo:      'db',
      mongodb:    'db',
      json:       'fs'
    });
  });
  
});