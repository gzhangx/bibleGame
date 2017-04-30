const bibleSet = require('./bibleSet');
const maxlen = 80;
//console.log(bibleSet.books['Luke']);

let redirectionLevel = 2;
const bookName = process.argv[2];
const chapters = [];
for (let chapi = 3; chapi < process.argv.length; chapi++) {
   chapters.push(process.argv[chapi]);
}
const hideNumber = chapters.reduce((h,i)=>h||(i=='h'), false);

const translates = {};

for(let i = 0; i < chapters.length; i++) if (chapters[i].startsWith(':')) addTranslates(translates, chapters[i]);

function addTranslates(acc, str) {
  str.split('').forEach(v=>{acc[v]={tran:v, count:0, show:true};});
}
addTranslates(translates,' !\(),.:\';?1234567890');

const notLetter = ' !\(),.:\';'.split('').reduce((acc,c)=>{acc[c] = true; return acc;}, {});

if (!bookName) return console.log('please specify book');
if (!bibleSet.books[bookName]) console.log('cant find book ' + bookName);


const book = bibleSet.books[bookName].reduce((acc, val)=>{
  if (chapters.reduce((res, chapter)=> {
      return (res || (chapter.indexOf(':') >= 0? val.verse === chapter :  val.verse.startsWith(chapter+ ':')));
    }, false)){
    acc.push(val);
  }
  return acc;
}, []);

const resultArray = [];
book.map(booki=> {
  booki.text.split('').forEach(c=>{
    if (!translates[c])translates[c] = {tran:c, count:1, show:false, from: c};
    else translates[c].count++;
  });
});

function posToNextWord(curWritePos, curLinePos, line, lineStart) {
  let i = curLinePos;
  for (; i < line.length; i++) {
    if (!notLetter[line[i]]) break;
  }
  for (; i < line.length; i++) {
    if (notLetter[line[i]]) { i--; break;}
  }
  return i - lineStart;
}

function shuffle(array) {
  var m = array.length, t, i;

  // While there remain elements to shuffle
  while (m) {

    // Pick a remaining element
    i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }

  return array;
}

const allChars = '01234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const redirections = [];
for (let i = 0; i < redirectionLevel; i++) {
  redirections.push([]);
  const curHide = shuffle(allChars.split(''));
  let cur = 0;
  for (let c in translates) {
    tran = translates[c];
    if(!tran.show) {
      const newTran = curHide[cur++];
      redirections[i].push({from: tran.tran, to:newTran});
      tran.from = tran.tran;
      tran.tran = newTran;
    }
  }
}

const chars = {};
book.map(booki=> {
  const hexr = [];
  const line = [];
  for (let i = 0; i < booki.text.length; i++) {
    const c = booki.text.substring(i,i+1);
    const info = translates[c];
    const hex = info.tran;    
         hexr.push(hex); 
    if (!translates[c].show) chars[c] = hex;
         line.push(c);    
  }
  if (!hideNumber) resultArray.push(booki.verse);
  const top = [''];
  const bottom = [''];

  let prevbig = false;  
  let lineStart = 0;
  for (let i = 0; i < hexr.length; i++) {
    const at = top.length - 1;
    const linei = line[i];
    const hex = hexr[i];
    const isHide = hex!=linei;
    const curtop = prevbig?'': (!isHide?' ':hex);
    prevbig = curtop.length === 2;
    top[at] += curtop;

    const tc = isHide? '_':line[i];

    bottom[at]+= tc;
    if(i>0 && notLetter[line[i]] && posToNextWord(top[at].length, i, line, lineStart) > maxlen) {    
        top.push('');
        bottom.push('');
        lineStart = i;
    }else if (top[at].length > maxlen) {
      top.push('');
      bottom.push('');
      lineStart = i;
    }
  }

   for (var i = 0; i < top.length; i++) {
     resultArray.push(top[i]);
     resultArray.push(bottom[i]);
  }
  //resultArray.push(booki.text);
  //resultArray.push(hexr);
  resultArray.push('');
});

//console.log(chars);

function debugShowFinalTranslation() {
const hexs=[];
const hexToChar = {};
for(let i in chars) {
    hexs.push(chars[i]);
    hexToChar[chars[i]] = i;
}

hexs.sort();
const top = hexs.reduce((acc,val)=>{ const at = acc.length - 1; acc[at]+=val+' '; if (acc[at].length > maxlen) acc.push(''); return acc;}, ['']);
const bottom = hexs.reduce((acc,val)=>{ const at = acc.length - 1; acc[at]+=hexToChar[val]+' '; if (acc[at].length > maxlen) acc.push(''); return acc;}, ['']);

resultArray.push('');
for (var i = 0; i < top.length; i++) {
   resultArray.push(top[i]);
   resultArray.push(bottom[i]);
}

}


function printOneLine(fromTo) {
   const breakLine = op=>fromTo.reduce((acc,val)=>{ const at = acc.length - 1; acc[at]+=val[op]+' '; if (acc[at].length > maxlen) acc.push(''); return acc;}, ['']);
   const top = breakLine('to');
   const bottom = breakLine('from');

   resultArray.push('');
   for (var i = 0; i < top.length; i++) {
      resultArray.push(top[i]);
      resultArray.push(bottom[i]);
   }
}

for (let i = redirections.length - 1; i >= 0; i--) {
  printOneLine(shuffle(redirections[i]));
  resultArray.push('');  
}

console.log(resultArray.join('\r\n'));

function showCharStatistics() {
const charsh = {};
for(let c in translates) {
   const info = translates[c];
   if (info.show) continue;
  if (!charsh[info.count])charsh[info.count] = c;
  else {
    if (Array.isArray(charsh[info.count]))
      charsh[info.count].push(c);
    else charsh[info.count] = [charsh[info.count],c];
  }
}
  console.log(charsh);
}
showCharStatistics();
