const User = require('../model/user');
 
async function  findUserUsingEmail(email)  {
    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            var errObj = {
                code: 404,
                message:"User not found"
            }
            return [errObj,null];
        } else {
            return [null,user];
        }
    } catch (err) {
        console.log(err);
        var errObj = {
            code: 500,
            message: "Internal server error"
        };
        return [errObj, null]; 
    }
}

module.exports = findUserUsingEmail;