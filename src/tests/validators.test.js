const {test} = require('node:test');
const assert = require('node:assert/strict');
const validators = require('../validators');

test('isValidUsername', () => {
  assert.strictEqual(validators.isValidUsername(234), false);
  assert.strictEqual(validators.isValidUsername('griffpatch'), true);
  assert.strictEqual(validators.isValidUsername('gr1fF_p4tch'), true);
  assert.strictEqual(validators.isValidUsername('griff patch'), false);
  assert.strictEqual(validators.isValidUsername(' griffpatch'), false);
  assert.strictEqual(validators.isValidUsername('abcdé'), false);
  assert.strictEqual(validators.isValidUsername(''), false);
  assert.strictEqual(validators.isValidUsername('e'), true);
  assert.strictEqual(validators.isValidUsername('ee'), true);
  assert.strictEqual(validators.isValidUsername('eee'), true);
  assert.strictEqual(validators.isValidUsername('e'.repeat(19)), true);
  assert.strictEqual(validators.isValidUsername('e'.repeat(20)), true);
  assert.strictEqual(validators.isValidUsername('e'.repeat(21)), false);
  assert.strictEqual(validators.isValidUsername('ScratchCat'), false);
  assert.strictEqual(validators.isValidUsername(null), false);
  assert.strictEqual(validators.isValidUsername(undefined), false);
  assert.strictEqual(validators.isValidUsername(true), false);
  assert.strictEqual(validators.isValidUsername(false), false);
  assert.strictEqual(validators.isValidUsername([]), false);
  assert.strictEqual(validators.isValidUsername({}), false);
  // let's test some real usernames (or slight variations)
  // no particular meaning in any of these names, just what I could find in the moment
  // the idea is that if we get a big enough variety of names here, any problems in isValidUsername and especially naughty word detection will be caught
  assert.strictEqual(validators.isValidUsername('griffpatch_tutor'), true);
  assert.strictEqual(validators.isValidUsername('-RISEN-'), true);
  assert.strictEqual(validators.isValidUsername('Coltroc'), true);
  assert.strictEqual(validators.isValidUsername('Blue_Science'), true);
  assert.strictEqual(validators.isValidUsername('atomicmagicnumber'), true);
  assert.strictEqual(validators.isValidUsername('JWhandle'), true);
  assert.strictEqual(validators.isValidUsername('josephjustin'), true);
  assert.strictEqual(validators.isValidUsername('UltraCoolGames'), true);
  assert.strictEqual(validators.isValidUsername('Hobson-TV'), true);
  assert.strictEqual(validators.isValidUsername('BoyMcBoy-'), true);
  assert.strictEqual(validators.isValidUsername('AquaLeafStudios'), true);
  assert.strictEqual(validators.isValidUsername('GarboMuffin'), true);
  assert.strictEqual(validators.isValidUsername('SullyBully'), true);
  assert.strictEqual(validators.isValidUsername('SapphireDemon-'), true);
  assert.strictEqual(validators.isValidUsername('AnExtremelyLongName'), true);
  assert.strictEqual(validators.isValidUsername('PotatoAnimator'), true);
  assert.strictEqual(validators.isValidUsername('EliMendez19Test'), true);
  assert.strictEqual(validators.isValidUsername('BESTERNOOB'), true);
  assert.strictEqual(validators.isValidUsername('cs123123123'), true);
  assert.strictEqual(validators.isValidUsername('Elec-citrus'), true);
  assert.strictEqual(validators.isValidUsername('yeetthehalls'), true);
  assert.strictEqual(validators.isValidUsername('KidArachnid'), true);
  assert.strictEqual(validators.isValidUsername('--FlamingGames--'), true);
  assert.strictEqual(validators.isValidUsername('Executec'), true);
  assert.strictEqual(validators.isValidUsername('Jethrochannz'), true);
  assert.strictEqual(validators.isValidUsername('DaBaconBossOfBosses'), true);
  assert.strictEqual(validators.isValidUsername('or2017'), true);
  assert.strictEqual(validators.isValidUsername('CANSLP'), true);
  assert.strictEqual(validators.isValidUsername('hfuller2953'), true);
  assert.strictEqual(validators.isValidUsername('Kraken265'), true);
  assert.strictEqual(validators.isValidUsername('Loev06'), true);
});

test('isValidRoomID', () => {
  assert.strictEqual(validators.isValidRoomID(''), false);
  assert.strictEqual(validators.isValidRoomID('123'), true);
  assert.strictEqual(validators.isValidRoomID('123.0'), true);
  assert.strictEqual(validators.isValidRoomID('-123'), true);
  assert.strictEqual(validators.isValidRoomID('@p4-project.sb3'), true);
  assert.strictEqual(validators.isValidRoomID(123), false);
  assert.strictEqual(validators.isValidRoomID(null), false);
  assert.strictEqual(validators.isValidRoomID(undefined), false);
  assert.strictEqual(validators.isValidRoomID(true), false);
  assert.strictEqual(validators.isValidRoomID(false), false);
  assert.strictEqual(validators.isValidRoomID([]), false);
  assert.strictEqual(validators.isValidRoomID({}), false);
});

test('isValidVariableName', () => {
  assert.strictEqual(validators.isValidVariableName('☁ Foo'), true);
  assert.strictEqual(validators.isValidVariableName('☁ this is a pretty long variable name but not too long'), true);
  assert.strictEqual(validators.isValidVariableName('☁ 123'), true);
  assert.strictEqual(validators.isValidVariableName(' ☁ 123'), false);
  assert.strictEqual(validators.isValidVariableName('☁ null'), true);
  assert.strictEqual(validators.isValidVariableName('null'), false);
  assert.strictEqual(validators.isValidVariableName('☁'), false);
  assert.strictEqual(validators.isValidVariableName('☁ '), false);
  assert.strictEqual(validators.isValidVariableName('☁ ' + 'e'.repeat(10000)), false);
  assert.strictEqual(validators.isValidVariableName(':cloud: Foo'), true);
  assert.strictEqual(validators.isValidVariableName(':cloud: this is a pretty long variable name but not too long'), true);
  assert.strictEqual(validators.isValidVariableName(':cloud: 123'), true);
  assert.strictEqual(validators.isValidVariableName(' :cloud: 123'), false);
  assert.strictEqual(validators.isValidVariableName(':cloud: null'), true);
  assert.strictEqual(validators.isValidVariableName('null'), false);
  assert.strictEqual(validators.isValidVariableName(':cloud:'), false);
  assert.strictEqual(validators.isValidVariableName(':cloud: '), false);
  assert.strictEqual(validators.isValidVariableName(':cloud: ' + 'e'.repeat(10000)), false);
  assert.strictEqual(validators.isValidVariableName(123), false);
  assert.strictEqual(validators.isValidVariableName(null), false);
  assert.strictEqual(validators.isValidVariableName(undefined), false);
  assert.strictEqual(validators.isValidVariableName(true), false);
  assert.strictEqual(validators.isValidVariableName(false), false);
  assert.strictEqual(validators.isValidVariableName([]), false);
  assert.strictEqual(validators.isValidVariableName({}), false);
});

test('isValidVariableValue', () => {
  assert.strictEqual(validators.isValidVariableValue({}), false);
  assert.strictEqual(validators.isValidVariableValue({1:2}), false);
  assert.strictEqual(validators.isValidVariableValue('{}'), false);
  assert.strictEqual(validators.isValidVariableValue('[object Object]'), false);
  assert.strictEqual(validators.isValidVariableValue([]), false);
  assert.strictEqual(validators.isValidVariableValue([1]), false);
  assert.strictEqual(validators.isValidVariableValue([1,2,3]), false);
  assert.strictEqual(validators.isValidVariableValue('[]'), false);
  assert.strictEqual(validators.isValidVariableValue(true), false);
  assert.strictEqual(validators.isValidVariableValue('true'), false);
  assert.strictEqual(validators.isValidVariableValue(false), false);
  assert.strictEqual(validators.isValidVariableValue('false'), false);
  assert.strictEqual(validators.isValidVariableValue(null), false);
  assert.strictEqual(validators.isValidVariableValue('null'), false);
  assert.strictEqual(validators.isValidVariableValue(undefined), false);
  assert.strictEqual(validators.isValidVariableValue('undefined'), false);
  assert.strictEqual(validators.isValidVariableValue(Infinity), false);
  assert.strictEqual(validators.isValidVariableValue('Infinity'), false);
  assert.strictEqual(validators.isValidVariableValue(Infinity), false);
  assert.strictEqual(validators.isValidVariableValue('-Infinity'), false);
  assert.strictEqual(validators.isValidVariableValue(-Infinity), false);
  assert.strictEqual(validators.isValidVariableValue(NaN), false);
  assert.strictEqual(validators.isValidVariableValue('NaN'), false);
  assert.strictEqual(validators.isValidVariableValue('abcde'), false);
  assert.strictEqual(validators.isValidVariableValue('☁'), false);
  assert.strictEqual(validators.isValidVariableValue(''), true);
  assert.strictEqual(validators.isValidVariableValue(' '), false);
  assert.strictEqual(validators.isValidVariableValue('.'), false);
  assert.strictEqual(validators.isValidVariableValue('. '), false);
  assert.strictEqual(validators.isValidVariableValue(' .'), false);
  assert.strictEqual(validators.isValidVariableValue('..'), false);
  assert.strictEqual(validators.isValidVariableValue('-'), false);
  assert.strictEqual(validators.isValidVariableValue('--'), false);
  assert.strictEqual(validators.isValidVariableValue('- '), false);
  assert.strictEqual(validators.isValidVariableValue(' -'), false);
  assert.strictEqual(validators.isValidVariableValue('-2500'), true);
  assert.strictEqual(validators.isValidVariableValue(-2500), true);
  assert.strictEqual(validators.isValidVariableValue('2500'), true);
  assert.strictEqual(validators.isValidVariableValue(2500), true);
  assert.strictEqual(validators.isValidVariableValue('-0.0'), true);
  assert.strictEqual(validators.isValidVariableValue('-0.12'), true);
  assert.strictEqual(validators.isValidVariableValue('-0'), true);
  assert.strictEqual(validators.isValidVariableValue(-0), true);
  assert.strictEqual(validators.isValidVariableValue('0.0'), true);
  assert.strictEqual(validators.isValidVariableValue('0.1'), true);
  assert.strictEqual(validators.isValidVariableValue('0'), true);
  assert.strictEqual(validators.isValidVariableValue(0), true);
  assert.strictEqual(validators.isValidVariableValue('1'), true);
  assert.strictEqual(validators.isValidVariableValue(1), true);
  assert.strictEqual(validators.isValidVariableValue('4-'), false);
  assert.strictEqual(validators.isValidVariableValue('4 '), false);
  assert.strictEqual(validators.isValidVariableValue(' 4'), false);
  assert.strictEqual(validators.isValidVariableValue('4.00'), true);
  assert.strictEqual(validators.isValidVariableValue('4..00'), false);
  assert.strictEqual(validators.isValidVariableValue('4.0-0'), false);
  assert.strictEqual(validators.isValidVariableValue('4.'), true);
  assert.strictEqual(validators.isValidVariableValue('-4.'), true);
  assert.strictEqual(validators.isValidVariableValue('-4'), true);
  assert.strictEqual(validators.isValidVariableValue('-4.0'), true);
  assert.strictEqual(validators.isValidVariableValue('-4.00'), true);
  assert.strictEqual(validators.isValidVariableValue('-4.000000'), true);
  assert.strictEqual(validators.isValidVariableValue('-4.000000.'), false);
  assert.strictEqual(validators.isValidVariableValue('-4.000000.0'), false);
  assert.strictEqual(validators.isValidVariableValue('.32'), true);
  assert.strictEqual(validators.isValidVariableValue('-.32'), true);
  assert.strictEqual(validators.isValidVariableValue('--4'), false);
  assert.strictEqual(validators.isValidVariableValue('-777777.44'), true);
  assert.strictEqual(validators.isValidVariableValue('00003.3330000'), true);
  assert.strictEqual(validators.isValidVariableValue('-00003.3330000'), true);
  assert.strictEqual(validators.isValidVariableValue('3..3'), false);
  assert.strictEqual(validators.isValidVariableValue(0x03), true);
  assert.strictEqual(validators.isValidVariableValue('0x03'), false);
  assert.strictEqual(validators.isValidVariableValue('-0x03'), false);
  assert.strictEqual(validators.isValidVariableValue('3n'), false);
  assert.strictEqual(validators.isValidVariableValue('1,000'), false);
  assert.strictEqual(validators.isValidVariableValue(1e+100), true);
  assert.strictEqual(validators.isValidVariableValue(0.1e+100), true);
  assert.strictEqual(validators.isValidVariableValue(-1e+100), true);
  assert.strictEqual(validators.isValidVariableValue(1e-100), true);
  assert.strictEqual(validators.isValidVariableValue(-1e-100), true);
  assert.strictEqual(validators.isValidVariableValue(-1.5e-101), true);
  assert.strictEqual(validators.isValidVariableValue(1e+0), true);
  assert.strictEqual(validators.isValidVariableValue(4.983873181796813e+128), true);
  assert.strictEqual(validators.isValidVariableValue(-4.983873181796813e+128), true);
  assert.strictEqual(validators.isValidVariableValue(-4.983873181796813e+10000), false);
  assert.strictEqual(validators.isValidVariableValue('1e+100'), false);
  assert.strictEqual(validators.isValidVariableValue('4.983873181796813e+128'), false);
  assert.strictEqual(validators.isValidVariableValue('01e+100'), false);
  assert.strictEqual(validators.isValidVariableValue('1e+10'), false);
  assert.strictEqual(validators.isValidVariableValue('1e1'), false);
  assert.strictEqual(validators.isValidVariableValue('1E1'), false);
  assert.strictEqual(validators.isValidVariableValue('-1e+10'), false);
  // long vars
  assert.strictEqual(validators.isValidVariableValue('-' + '1'.repeat(100)), true);
  assert.strictEqual(validators.isValidVariableValue('-' + '1'.repeat(100) + '.' + '1'.repeat(100)), true);
  for (var i = 100; i < 256; i++) {
    assert.strictEqual(validators.isValidVariableValue('1'.repeat(i)), true);
    assert.strictEqual(validators.isValidVariableValue('-' + '1'.repeat(i)), true);
  }
  // too long
  assert.strictEqual(validators.isValidVariableValue('1'.repeat(1000000)), false);
  // ascii neighbors to 0, 9
  assert.strictEqual(validators.isValidVariableValue('/'), false);
  assert.strictEqual(validators.isValidVariableValue(':'), false);
  // actual cloud variable samples from real projects
  assert.strictEqual(validators.isValidVariableValue('121121038464634514854524245338529813421560282228134215602822281342156028222818421560282228290310010102131342156028222813421560282228'), true); // https://scratch.mit.edu/projects/12785898/
  assert.strictEqual(validators.isValidVariableValue('379741339735283235319715161527061916240207071306973097339741363797070213200697'), true); // https://scratch.mit.edu/projects/311764678/
  assert.strictEqual(validators.isValidVariableValue('64885663555655556256626464645555636153565358606258585316181618161816181618010305536253645364535553'), true); // https://scratch.mit.edu/projects/370996134/
  assert.strictEqual(validators.isValidVariableValue('081106020130142912311419272312361629046502010307096610016503070766080107010201020125010301'), true); // https://scratch.mit.edu/projects/335884915/
  assert.strictEqual(validators.isValidVariableValue('1210272429390012102724293900121027242939001210272429390012102724293900291714271413163034373839400029171427141316303437383940002917142714131630343738394000'), true); // https://scratch.mit.edu/projects/398782663/
  assert.strictEqual(validators.isValidVariableValue('47414048363737383938413738454036374100404438483900291412172222102337004200450045004500450044454240404500'), true); // https://scratch.mit.edu/projects/408252905/
  assert.strictEqual(validators.isValidVariableValue(3.2959163851126096e+128), true); // https://scratch.mit.edu/projects/408252905/
});
