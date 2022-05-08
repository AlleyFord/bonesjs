/*
  text & number formatting
*/
class Format {
  currency(v) {
    return parseFloat(String(v).replace(/[^\d\.]/g, '')).toFixed(2);
  }
}



export { Format };
