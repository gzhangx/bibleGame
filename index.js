const bibleSet = require('./bibleSet');
const maxlen = 80;
//console.log(bibleSet.books['Luke']);

const bookName = process.argv[2];
const chapters = [];
for (let chapi = 3; chapi < process.argv.length; chapi++) {
   chapters.push(process.argv[chapi]);
}
const hideNumber = chapters.reduce((h,i)=>h||(i=='h'), false);

const translates = chapters.reduce((h,i)=>h||(i.startsWith(':')?i.substring(1).split('').reduce((acc,v)=>{acc[v]={tran:v, count:1, show:true};return acc;},{}):''), false);

function addTranslates(acc, str) {
  str.split('').forEach(v=>{acc[v]={tran:v, count:0, show:true};});
}
addTranslates(translates,' !\(),.:\';');

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


const chars = {};

const resultArray = [];
book.map(booki=> {
  booki.text.split('').forEach(c=>{
    if (!translates[c])translates[c] = {tran:Buffer.from(c).toString('hex'), count:1, show:false};
    else translates[c].count++;
  });
});


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
  
  for (let i = 0; i < hexr.length; i++) {
    const at = top.length - 1;
    const hex = hexr[i];
    top[at] += hex.length == 1? ' ': hex;

    const tc = hex.length === 2? ' _':line[i];

    bottom[at]+= tc;
    if (top[at].length > maxlen) {
      top.push('');
      bottom.push('');
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
const hexs=[];
const hexToChar = {};
for(let i in chars) {
    hexs.push(chars[i]);
    hexToChar[chars[i]] = i;
}

hexs.sort();
const top = hexs.reduce((acc,val)=>{ const at = acc.length - 1; acc[at]+=val+' '; if (acc[at].length > maxlen) acc.push(''); return acc;}, ['']);
const bottom = hexs.reduce((acc,val)=>{ const at = acc.length - 1; acc[at]+=hexToChar[val]+'  '; if (acc[at].length > maxlen) acc.push(''); return acc;}, ['']);

resultArray.push('');
for (var i = 0; i < top.length; i++) {
   resultArray.push(top[i]);
   resultArray.push(bottom[i]);
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