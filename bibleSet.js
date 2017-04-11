const fs = require('fs');
const bibleText = fs.readFileSync('THEBIBLE.TXT').toString().replace(/\r/g,'').split('\n');
//console.log(bibleText);
const bibleSet = {
  titles:[],
  dict:{},
  books:{}
};

for (let i = 0; i < bibleText.length; i+=3) {
   const titleAndVerse = bibleText[i];    
   if (titleAndVerse != ''){
     bibleSet.dict[titleAndVerse] = bibleText[i+1];
     bibleSet.titles.push(titleAndVerse);
     const bookParts = titleAndVerse.split(' ');
     const book = bookParts[0] + (bookParts.length == 3?bookParts[1]:'');
     const verse = bookParts[bookParts.length - 1];
     if (!bibleSet.books[book]) {
       bibleSet.books[book] = [];
     }
     bibleSet.books[book].push({verse, text:bibleText[i+1]});
   }
}

//console.log(bibleSet.titles);
//console.log(bibleSet.books['Luke']);
module.exports = bibleSet;