'use strict';

const Diff = require('jsdiff');
const fs = require('fs');
const fse = require('fs-extra');

const read = require('fs-readdir-recursive');

const BASE_DIR = process.cwd() + '/';

console.time('Execution-time');
let files1 = read(BASE_DIR);
let files2 = read(BASE_DIR);

let ext = /\.pdf$/;
let dup = /___duplicates/;

// if (!files1.length) {
//   console.log('No files found.');
//   process.exit();
// }

files1 = files1.filter((f1) => ext.test(f1) && !dup.test(f1));
files2 = files2.filter((f2) => ext.test(f2) && !dup.test(f2));

if (!files1.length) {
  console.log('No PDF files found.');
  process.exit();
}

console.log('Reading contents...');
let file_contents_1 = files1.map((f1) => fs.readFileSync(BASE_DIR + f1).toString('base64'));
let file_contents_2 = files2.map((f2) => fs.readFileSync(BASE_DIR + f2).toString('base64'));

let totalFiles = files1.length;
let uniqueFiles = 0;
let duplicateFiles = 0;

// if(fs.readdirSync(BASE_DIR)) {
//
// }
// fs.mkdirSync(BASE_DIR + '/___duplicates/');

if (!fs.existsSync(BASE_DIR + '___duplicates')) {
  fs.mkdirSync(BASE_DIR + '/___duplicates/');
}

file_contents_1.map((f1, i1) => {
  // console.log('----->   ' + files1[i1]);
  let duplicates = [];
  file_contents_2.map((f2, i2) => {
    if (files1[i1] !== files2[i2] && !Diff(f1, f2)) {
      duplicates.push(files2[i2]);
    }
  });

  if (!duplicates.length) {
    uniqueFiles++;
    // console.log('No duplicates found.');
  } else {
    console.log('----->   ' + files1[i1]);
    console.log('Duplicates: ');
    console.log(duplicates.toString());
    console.log();

    duplicates.map((duplicate) => {
      let dupIndex = files2.indexOf(duplicate);

      files1.splice(dupIndex, 1);
      files2.splice(dupIndex, 1);
      file_contents_1.splice(dupIndex, 1);
      file_contents_2.splice(dupIndex, 1);
    });

    uniqueFiles++;
    duplicateFiles += duplicates.length;

    // duplicateFiles++;

    duplicates.map((duplicate) => {
      // fs.renameSync(BASE_DIR + duplicate, BASE_DIR + '___duplicates/' + duplicate, {recursive: true});
      fse.moveSync(BASE_DIR + duplicate, BASE_DIR + '___duplicates/' + duplicate);
    });
  }
});

console.timeEnd('Execution-time');

console.log('Total files: ', totalFiles);
console.log('Unique files: ', uniqueFiles);
console.log('Duplicate files: ', duplicateFiles);
