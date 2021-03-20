const validators = require('../validators');

test('isValidRoomID', () => {
  expect(validators.isValidRoomID('')).toBe(false);
  expect(validators.isValidRoomID('123')).toBe(true);
  expect(validators.isValidRoomID('123.0')).toBe(false);
  expect(validators.isValidRoomID('-123')).toBe(false);
  expect(validators.isValidRoomID(123)).toBe(false);
  expect(validators.isValidRoomID(null)).toBe(false);
  expect(validators.isValidRoomID(undefined)).toBe(false);
  expect(validators.isValidRoomID(true)).toBe(false);
  expect(validators.isValidRoomID(false)).toBe(false);
  expect(validators.isValidRoomID([])).toBe(false);
  expect(validators.isValidRoomID({})).toBe(false);
});

test('isValidVariableName', () => {
  expect(validators.isValidVariableName('☁ Foo')).toBe(true);
  expect(validators.isValidVariableName('☁ this is a pretty long variable name but not too long')).toBe(true);
  expect(validators.isValidVariableName('☁ 123')).toBe(true);
  expect(validators.isValidVariableName(' ☁ 123')).toBe(false);
  expect(validators.isValidVariableName('☁ null')).toBe(true);
  expect(validators.isValidVariableName('null')).toBe(false);
  expect(validators.isValidVariableName('☁')).toBe(false);
  expect(validators.isValidVariableName('☁ ')).toBe(false);
  expect(validators.isValidVariableName('☁ ' + 'e'.repeat(10000))).toBe(false);
  expect(validators.isValidVariableName(123)).toBe(false);
  expect(validators.isValidVariableName(null)).toBe(false);
  expect(validators.isValidVariableName(undefined)).toBe(false);
  expect(validators.isValidVariableName(true)).toBe(false);
  expect(validators.isValidVariableName(false)).toBe(false);
  expect(validators.isValidVariableName([])).toBe(false);
  expect(validators.isValidVariableName({})).toBe(false);
});

test('isValidVariableValue', () => {
  expect(validators.isValidVariableValue({})).toBe(false);
  expect(validators.isValidVariableValue({1:2})).toBe(false);
  expect(validators.isValidVariableValue('{}')).toBe(false);
  expect(validators.isValidVariableValue('[object Object]')).toBe(false);
  expect(validators.isValidVariableValue([])).toBe(false);
  expect(validators.isValidVariableValue([1])).toBe(false);
  expect(validators.isValidVariableValue([1,2,3])).toBe(false);
  expect(validators.isValidVariableValue('[]')).toBe(false);
  expect(validators.isValidVariableValue(true)).toBe(false);
  expect(validators.isValidVariableValue('true')).toBe(false);
  expect(validators.isValidVariableValue(false)).toBe(false);
  expect(validators.isValidVariableValue('false')).toBe(false);
  expect(validators.isValidVariableValue(null)).toBe(false);
  expect(validators.isValidVariableValue('null')).toBe(false);
  expect(validators.isValidVariableValue(undefined)).toBe(false);
  expect(validators.isValidVariableValue('undefined')).toBe(false);
  expect(validators.isValidVariableValue(Infinity)).toBe(false);
  expect(validators.isValidVariableValue('Infinity')).toBe(false);
  expect(validators.isValidVariableValue(Infinity)).toBe(false);
  expect(validators.isValidVariableValue('-Infinity')).toBe(false);
  expect(validators.isValidVariableValue(-Infinity)).toBe(false);
  expect(validators.isValidVariableValue(NaN)).toBe(false);
  expect(validators.isValidVariableValue('NaN')).toBe(false);
  expect(validators.isValidVariableValue('abcde')).toBe(false);
  expect(validators.isValidVariableValue('☁')).toBe(false);
  expect(validators.isValidVariableValue('')).toBe(true);
  expect(validators.isValidVariableValue(' ')).toBe(false);
  expect(validators.isValidVariableValue('.')).toBe(false);
  expect(validators.isValidVariableValue('. ')).toBe(false);
  expect(validators.isValidVariableValue(' .')).toBe(false);
  expect(validators.isValidVariableValue('..')).toBe(false);
  expect(validators.isValidVariableValue('-')).toBe(false);
  expect(validators.isValidVariableValue('--')).toBe(false);
  expect(validators.isValidVariableValue('- ')).toBe(false);
  expect(validators.isValidVariableValue(' -')).toBe(false);
  expect(validators.isValidVariableValue('-2500')).toBe(true);
  expect(validators.isValidVariableValue(-2500)).toBe(true);
  expect(validators.isValidVariableValue('2500')).toBe(true);
  expect(validators.isValidVariableValue(2500)).toBe(true);
  expect(validators.isValidVariableValue('-0.0')).toBe(true);
  expect(validators.isValidVariableValue('-0.12')).toBe(true);
  expect(validators.isValidVariableValue('-0')).toBe(true);
  expect(validators.isValidVariableValue(-0)).toBe(true);
  expect(validators.isValidVariableValue('0.0')).toBe(true);
  expect(validators.isValidVariableValue('0.1')).toBe(true);
  expect(validators.isValidVariableValue('0')).toBe(true);
  expect(validators.isValidVariableValue(0)).toBe(true);
  expect(validators.isValidVariableValue('1')).toBe(true);
  expect(validators.isValidVariableValue(1)).toBe(true);
  expect(validators.isValidVariableValue('4-')).toBe(false);
  expect(validators.isValidVariableValue('4 ')).toBe(false);
  expect(validators.isValidVariableValue(' 4')).toBe(false);
  expect(validators.isValidVariableValue('4.00')).toBe(true);
  expect(validators.isValidVariableValue('4..00')).toBe(false);
  expect(validators.isValidVariableValue('4.0-0')).toBe(false);
  expect(validators.isValidVariableValue('4.')).toBe(true);
  expect(validators.isValidVariableValue('-4.')).toBe(true);
  expect(validators.isValidVariableValue('-4')).toBe(true);
  expect(validators.isValidVariableValue('-4.0')).toBe(true);
  expect(validators.isValidVariableValue('-4.00')).toBe(true);
  expect(validators.isValidVariableValue('-4.000000')).toBe(true);
  expect(validators.isValidVariableValue('-4.000000.')).toBe(false);
  expect(validators.isValidVariableValue('-4.000000.0')).toBe(false);
  expect(validators.isValidVariableValue('.32')).toBe(true);
  expect(validators.isValidVariableValue('-.32')).toBe(true);
  expect(validators.isValidVariableValue('--4')).toBe(false);
  expect(validators.isValidVariableValue('-777777.44')).toBe(true);
  expect(validators.isValidVariableValue('00003.3330000')).toBe(true);
  expect(validators.isValidVariableValue('-00003.3330000')).toBe(true);
  expect(validators.isValidVariableValue('3..3')).toBe(false);
  expect(validators.isValidVariableValue(0x03)).toBe(true);
  expect(validators.isValidVariableValue('0x03')).toBe(false);
  expect(validators.isValidVariableValue('-0x03')).toBe(false);
  expect(validators.isValidVariableValue('3n')).toBe(false);
  expect(validators.isValidVariableValue('1,000')).toBe(false);
  expect(validators.isValidVariableValue(1e+100)).toBe(true);
  expect(validators.isValidVariableValue(0.1e+100)).toBe(true);
  expect(validators.isValidVariableValue(-1e+100)).toBe(true);
  expect(validators.isValidVariableValue(1e-100)).toBe(true);
  expect(validators.isValidVariableValue(-1e-100)).toBe(true);
  expect(validators.isValidVariableValue(-1.5e-101)).toBe(true);
  expect(validators.isValidVariableValue(1e+0)).toBe(true);
  expect(validators.isValidVariableValue(4.983873181796813e+128)).toBe(true);
  expect(validators.isValidVariableValue(-4.983873181796813e+128)).toBe(true);
  expect(validators.isValidVariableValue(-4.983873181796813e+10000)).toBe(false);
  expect(validators.isValidVariableValue('1e+100')).toBe(false);
  expect(validators.isValidVariableValue('4.983873181796813e+128')).toBe(false);
  expect(validators.isValidVariableValue('01e+100')).toBe(false);
  expect(validators.isValidVariableValue('1e+10')).toBe(false);
  expect(validators.isValidVariableValue('1e1')).toBe(false);
  expect(validators.isValidVariableValue('1E1')).toBe(false);
  expect(validators.isValidVariableValue('-1e+10')).toBe(false);
  // long vars
  expect(validators.isValidVariableValue('-' + '1'.repeat(100))).toBe(true);
  expect(validators.isValidVariableValue('-' + '1'.repeat(100) + '.' + '1'.repeat(100))).toBe(true);
  for (var i = 100; i < 256; i++) {
    expect(validators.isValidVariableValue('1'.repeat(i))).toBe(true);
    expect(validators.isValidVariableValue('-' + '1'.repeat(i))).toBe(true);
  }
  // too long
  expect(validators.isValidVariableValue('1'.repeat(100000))).toBe(false);
  // ascii neighbors to 0, 9
  expect(validators.isValidVariableValue('/')).toBe(false);
  expect(validators.isValidVariableValue(':')).toBe(false);
  // actual cloud variable samples from real projects
  expect(validators.isValidVariableValue('121121038464634514854524245338529813421560282228134215602822281342156028222818421560282228290310010102131342156028222813421560282228')).toBe(true); // https://scratch.mit.edu/projects/12785898/
  expect(validators.isValidVariableValue('379741339735283235319715161527061916240207071306973097339741363797070213200697')).toBe(true); // https://scratch.mit.edu/projects/311764678/
  expect(validators.isValidVariableValue('64885663555655556256626464645555636153565358606258585316181618161816181618010305536253645364535553')).toBe(true); // https://scratch.mit.edu/projects/370996134/
  expect(validators.isValidVariableValue('081106020130142912311419272312361629046502010307096610016503070766080107010201020125010301')).toBe(true); // https://scratch.mit.edu/projects/335884915/
  expect(validators.isValidVariableValue('1210272429390012102724293900121027242939001210272429390012102724293900291714271413163034373839400029171427141316303437383940002917142714131630343738394000')).toBe(true); // https://scratch.mit.edu/projects/398782663/
  expect(validators.isValidVariableValue('47414048363737383938413738454036374100404438483900291412172222102337004200450045004500450044454240404500')).toBe(true); // https://scratch.mit.edu/projects/408252905/
  expect(validators.isValidVariableValue(3.2959163851126096e+128)).toBe(true); // https://scratch.mit.edu/projects/408252905/
});
