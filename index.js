const bibleSet = require('./bibleSet');
const maxlen = 100;
//console.log(bibleSet.books['Luke']);

const bookName = process.argv[2];
const chapters = [];
for (let chapi = 3; chapi < process.argv.length; chapi++) {
   chapters.push(process.argv[chapi]);
}
const hideNumber = chapters.reduce((h,i)=>h||(i=='h'), false);

const showLetters = chapters.reduce((h,i)=>h||(i.startsWith(':')?i.substring(1).split('').reduce((acc,v)=>{acc[v]=v;return acc;},{}):''), false);
console.log(showLetters);
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
const charStatistics = {};
const resultArray = [];
book.map(booki=> {
  const hex = Buffer.from(booki.text).toString('hex').toUpperCase();
  const hexr = [];
  const translate = {};
  for (let i = 0; i < hex.length; i+=2) {
    const hex2 = hex.substring(i,i+2);
    switch (hex2)
    {
       case '20': hexr.push(' ');break;
       case '21': hexr.push('!');break;
       case '27': hexr.push('\'');break;
       case '28': hexr.push('(');break;
       case '29': hexr.push(')');break;
       case '2C': hexr.push(',');break;
       case '2E': hexr.push('.');break;
       case '3A': hexr.push(':');break;
       case '3B': hexr.push(';');break;
       default: 
         hexr.push(hex2);
         const c = Buffer.from(hex2,'hex');
         chars[c] = hex2;
         translate[hex2] = c;
         if (charStatistics[c]) charStatistics[c]++; else charStatistics[c] = 1;
       break;
    }
  }
  if (!hideNumber) resultArray.push(booki.verse);
  const top = [''];
  const bottom = [''];
  
  for (let i = 0; i < hexr.length; i++) {
    const at = top.length - 1;
    top[at] += hexr[i];
    let tc = translate[hexr[i]];
    if (!tc) tc = hexr[i];
    else {
      //translated
      if (hideNumber) {
         tc = showLetters[tc] || '_';
      }
      tc = ' ' + tc;
    }
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

const charsh = {};
for(let i in charStatistics) { 
  if (!charsh[charStatistics[i]])charsh[charStatistics[i]] = i;
  else {
    if (Array.isArray(charsh[charStatistics[i]]))
      charsh[charStatistics[i]].push(i);
    else charsh[charStatistics[i]] = [charsh[charStatistics[i]],i];
  }
}
console.log(charsh);