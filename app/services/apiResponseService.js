exports.generateResponse = function (statusCode, message, errorType, data) {
    /* if message contains result.resultheader then 
        show external error first if it doesnt exist 
        then show resultMsg 
    */
    
    if (message.ExternalError !== undefined) {
        message = mapCustomBusinessErrors(message, errorType); //error contains "Offers_activation_Service" string in case of offers
    } else if (message.ResultMsg !== undefined) {
        message = message.ResultMsg;
    }

    let response = {
        statusCode: statusCode,
        message: message,
        error: errorType,
        data: data,
        meta: {}
    };
    return response;

}

const mapCustomBusinessErrors = function(message, errorType){
    
}