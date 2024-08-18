class ApiErrors{
    constructor(
        statusCode, 
        message = "Something went wrong",
        errors = [],
        stack
    ){

        this.statusCode = statusCode
        this.message = message
        this.data = null
        this.success = false;
        this.errors = errors;

        if (stack){
            this.stack = stack;
        }else{
            Error.captureStackTrace(this, this.constructor)
        }

    }
}
export {ApiErrors}