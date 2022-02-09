exports.applyCountryPrefix = function (phonenum) {
    //inverse of the country code prefix. this function applies 92 prefix instead of replacing it with a zero
    if (phonenum.substr(0, 4) == "0092") {
        //replace country code zeros with 92
        return phonenum.replace(/^.{4}/g, '92');
    } else if (phonenum.substr(0, 1) == "0") {
        //replace zero with 92 country code
        return phonenum.replace(/^.{1}/g, '92');
    } else if (phonenum.substr(0, 2) == "92") {
        //all ok do nothing
        return phonenum;
    } else {
        return phonenum;
    }

}

exports.country_code_prefix_to_zero = function (phone_num) {
    /*Country code feature re-implemented
      Replace country code in phone numbers with a zero. 
      JBOSS APIs donot accept numbers starting with 92. 
      Whereas BI APIs take need country code prefix with the numbers  
    */
    if (phone_num.substr(0, 2) == '92') {
        return phone_num.replace(/^.{2}/g, '0'); //regex to choose first two characters
    } else {
        return phone_num;
    }
}