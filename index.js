const bibleSet = require('./bibleSet');

//console.log(bibleSet.books['Luke']);

const bookName = process.argv[2];
const chapter = process.argv[3];
if (!bookName) return console.log('please specify book');
if (!bibleSet.books[bookName]) console.log('cant find book ' + bookName);


const book = bibleSet.books[bookName].reduce((acc, val)=>{
  if (!chapter || val.verse.startsWith(chapter+':')){
    acc.push(val);
  }
  return acc;
}, []);


const chars = {};
book.map(booki=> {
  const hex = Buffer.from(booki.text).toString('hex').toUpperCase();
  let hexr = '';
  for (let i = 0; i < hex.length; i+=2) {
    const hex2 = hex.substring(i,i+2);
    switch (hex2)
    {
       case '20': hexr+=' ';break;
       case '21': hexr+='!';break;
       case '27': hexr+='\'';break;
       case '28': hexr+='(';break;
       case '29': hexr+=')';break;
       case '2C': hexr+=',';break;
       case '2E': hexr+='.';break;
       case '3A': hexr+=':';break;
       case '3B': hexr+=';';break;
       default: 
         hexr+= hex2;
         chars[Buffer.from(hex2,'hex')] = hex2;
       break;
    }
  }
  console.log(booki.verse+' ' + booki.text + ' ' + hexr);
});

//console.log(chars);
const hexs=[];
const hexToChar = {};
for(let i in chars) {
  hexs.push(chars[i]);
  hexToChar[chars[i]] = i;
}

hexs.sort();
const top = hexs.reduce((acc,val)=>{ const at = acc.length - 1; acc[at]+=val+' '; if (acc[at].length > 80) acc.push(''); return acc;}, ['']);
const bottom = hexs.reduce((acc,val)=>{ const at = acc.length - 1; acc[at]+=hexToChar[val]+'  '; if (acc[at].length > 80) acc.push(''); return acc;}, ['']);

for (var i = 0; i < top.length; i++) {
   console.log(top[i]);
   console.log(bottom[i]);
}