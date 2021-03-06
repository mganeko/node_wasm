// -------------------------
// mininode_wasm.js - Mini Node.js WASM translator by Node.js
// - 01: i32 literal
// - 02: binary operator
//   - 02: +
//   - 02: -, *, /, % 


"use strict"

const loadAndParseSrc = require('./module_parser_13.js');
const println = require('./module_println.js');
const printObj = require('./module_printobj.js');
const abort = require('./module_abort.js');
//const getTypeOf = require('./module_gettypeof.js');
//const getLength = require('./module_getlength.js');
//const getKeys = require('./module_getkeys.js');
const printWarn = require('./module_printwarn.js');
//const isDouble = require('./module_isdouble.js');
const writeFile = require('./module_writefile.js');

// ======== for comiler =======
function LF() {
  return '\n';
}

function TAB() {
  return '  ';
}

function TABs(n) {
  let tabs = '';
  let i = 0;
  while (i < n) {
    tabs = tabs + TAB();
    i = i + 1;
  }

  return tabs;
}

// ==== compile to WAST/WASM =====

// ---- compile simplified tree into WAST ---
function compile(tree) {
  const mainBlock = generate(tree, 2);

  let block = '(module' + LF();
  block = block + TAB() + '(export "exported_main" (func $main))' + LF();
  block = block + TAB() + '(func $main (result i32)' + LF();
  block = block + mainBlock + LF();
  block = block + TAB() + ')' + LF();
  block = block + ')';

  return block;
}

// ---- genereate WAST block ---
function generate(tree, indent) {
  if (tree === null) {
    return '';
  }

  if (tree[0] === 'lit') {
    return generateLiteral(tree, indent);
  }

  // --- add operator ---
  if (tree[0] === '+') {
    return generateAddOperator(tree, indent);
  }

  println('-- ERROR: unknown node in generate() ---');
  printObj(tree);
  abort();
}

// --- lit ---
function generateLiteral(tree, indent) {
  const v = tree[1];

  const block = TABs(indent) + '(i32.const ' + v + ')';
  return block;
}


// --- add operator ---
function generateAddOperator(tree, indent) {
  const leftBlock = generate(tree[1], indent + 1);
  const rightBlock = generate(tree[2], indent + 1);

  let block = TABs(indent) + '(i32.add' + LF();
  block = block + leftBlock + LF();
  block = block + rightBlock + LF();
  block = block + TABs(indent) + ')';
  return block;
}



// ======== start compiler =======

// --- load and parse source ---
printWarn('-- start WASM translator --');
const tree = loadAndParseSrc();
printWarn('--- source parsed ---');
printObj(tree);

// --- compile to WAST --
const wast = compile(tree);
printWarn('--- WAST generated ---');
println(wast);
writeFile('generated.wast', wast);

// -- to comvert to wasm ---
// $ wasm-as generated.wast