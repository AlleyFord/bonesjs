/*
  text & number formatting
*/



import Scaffold from '../scaffold.js';



class Format extends Scaffold {
  name = 'Format';

  currency(v) {
    return parseFloat(String(v).replace(/[^\d\.]/g, '')).toFixed(2);
  }
}



export default Format;
