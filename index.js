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


book.map(booki=> {
  const hex = Buffer.from(booki.text).toString('hex').toUpperCase();
  let hexr = '';
  for (let i = 0; i < hex.length; i+=2) {
    switch (hex.substring(i,i+2))
    {
       case '20': hexr+=' ';break;
       case '2E': hexr+='.';break;
       default: hexr+= hex.substring(i,i+2);
    }
  }
  console.log(booki.verse+' ' + booki.text + ' ' + hexr);
});
