var validators = require('../validators');

var start = Date.now();
var count = 0;

function assert(t) {
  if (!t) {
    throw new Error('failed');
  }
  count++;
}

for (var j = 0; j < 5000; j++) {
  assert(validators.isValidVariableValue({}) === false);
  assert(validators.isValidVariableValue('{}') === false);
  assert(validators.isValidVariableValue([]) === false);
  assert(validators.isValidVariableValue('[]') === false);
  assert(validators.isValidVariableValue(true) === false);
  assert(validators.isValidVariableValue('true') === false);
  assert(validators.isValidVariableValue(false) === false);
  assert(validators.isValidVariableValue('false') === false);
  assert(validators.isValidVariableValue(null) === false);
  assert(validators.isValidVariableValue('null') === false);
  assert(validators.isValidVariableValue(undefined) === false);
  assert(validators.isValidVariableValue('undefined') === false);
  assert(validators.isValidVariableValue(Infinity) === false);
  assert(validators.isValidVariableValue('Infinity') === false);
  assert(validators.isValidVariableValue(NaN) === false);
  assert(validators.isValidVariableValue('NaN') === false);
  assert(validators.isValidVariableValue('abcde') === false);
  assert(validators.isValidVariableValue('') === true);
  assert(validators.isValidVariableValue(' ') === false);
  assert(validators.isValidVariableValue('.') === false);
  assert(validators.isValidVariableValue('. ') === false);
  assert(validators.isValidVariableValue(' .') === false);
  assert(validators.isValidVariableValue('..') === false);
  assert(validators.isValidVariableValue(4) === false);
  assert(validators.isValidVariableValue('-') === false);
  assert(validators.isValidVariableValue('- ') === false);
  assert(validators.isValidVariableValue(' -') === false);
  assert(validators.isValidVariableValue('-2500') === true);
  assert(validators.isValidVariableValue('2500') === true);
  assert(validators.isValidVariableValue('2500') === true);
  assert(validators.isValidVariableValue('4-') === false);
  assert(validators.isValidVariableValue('4 ') === false);
  assert(validators.isValidVariableValue(' 4') === false);
  assert(validators.isValidVariableValue('4.00') === true);
  assert(validators.isValidVariableValue('4..00') === false);
  assert(validators.isValidVariableValue('4.0-0') === false);
  assert(validators.isValidVariableValue('4.') === true);
  assert(validators.isValidVariableValue('-4.') === true);
  assert(validators.isValidVariableValue('-4') === true);
  assert(validators.isValidVariableValue('-4.0') === true);
  assert(validators.isValidVariableValue('.32') === true);
  assert(validators.isValidVariableValue('-.32') === true);
  assert(validators.isValidVariableValue('--4') === false);
  assert(validators.isValidVariableValue('-777777.44') === true);
  assert(validators.isValidVariableValue('00003.3330000') === true);
  assert(validators.isValidVariableValue('-00003.3330000') === true);
  assert(validators.isValidVariableValue('3..3') === false);
  assert(validators.isValidVariableValue('3e3') === false);
  assert(validators.isValidVariableValue('-3e3') === false);
  assert(validators.isValidVariableValue('0x03') === false);
  assert(validators.isValidVariableValue('-0x03') === false);
  // long vars
  assert(validators.isValidVariableValue('-' + '1'.repeat(100)) === true);
  assert(validators.isValidVariableValue('-' + '1'.repeat(100) + '.' + '1'.repeat(100)) === true);
  for (var i = 1; i < 256; i++) {
    assert(validators.isValidVariableValue('1'.repeat(i)) === true);
    assert(validators.isValidVariableValue('-' + ('1'.repeat(i))) === true);
  }
  // // too long
  // assert(validators.isValidVariableValue('1'.repeat(10000)) === false);
  // // ascii neighbors to 0 === 9
  // assert(validators.isValidVariableValue('/') === false);
  // assert(validators.isValidVariableValue(':') === false);
  // actual cloud variable samples from real projects
  assert(validators.isValidVariableValue('121121038464634514854524245338529813421560282228134215602822281342156028222818421560282228290310010102131342156028222813421560282228') === true); // https://scratch.mit.edu/projects/12785898/
  assert(validators.isValidVariableValue('379741339735283235319715161527061916240207071306973097339741363797070213200697') === true); // https://scratch.mit.edu/projects/311764678/
  assert(validators.isValidVariableValue('64885663555655556256626464645555636153565358606258585316181618161816181618010305536253645364535553') === true); // https://scratch.mit.edu/projects/370996134/
  assert(validators.isValidVariableValue('081106020130142912311419272312361629046502010307096610016503070766080107010201020125010301') === true); // https://scratch.mit.edu/projects/335884915/
  assert(validators.isValidVariableValue('1210272429390012102724293900121027242939001210272429390012102724293900291714271413163034373839400029171427141316303437383940002917142714131630343738394000') === true); // https://scratch.mit.edu/projects/398782663/
}

var t = Date.now() - start;
console.log('time: ' + t + ' ms');
console.log('rate: ' + count/t + ' ops per ms');
