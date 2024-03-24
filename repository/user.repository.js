const User = require('../model/user');
const { badRequestResponse, serverErrorResponse } = require('../utils/response');

async function findIfTheyAreFriends(sendersId,receiversId) {
    try {
        const sender = await User.findById(sendersId);
        // const receiver = await User.findById(receiversId);

        const receiverInRequests = sender.friends.find(user => user._id.equals(receiversId));
        if (receiverInRequests) {
            return [null,receiverInRequests];
        }
    } catch (err) {
        console.log(err);
        var errObj = {
            code: 500,
            message:'Something Went Wrong'
        }
        return [errObj,null];
    }
}

async function findAllSentFriendReq(id) {
    try {
        const user = await User.findOne({ _id: id });
        const friendReq = user.requestSent;
        return [null, friendReq];
    } catch (err) {
        console.log(err);
        var errObj = {
            code: 500,
            message:'Something went wrong'
        }
        return [errObj, null];
    }
}

async function findAllReceivedFriendReq(id) {
    try {
        const user =await User.findOne({ _id: id });
        const friendReq = user.requestReceived;
        return [null, friendReq];
    } catch (err) {
        console.log(err);
        var errObj = {
            code: 500,
            message:'Something went wrong'
        }
        return [errObj, null];
    }
}

async function findByIdAndUpdateRequestReceived(receiversId,sendersId) {
    try {
        const user = await User.findByIdAndUpdate(
            receiversId,
            {
                $addToSet:{requestReceived : sendersId}
            },
            {new:true}
        );
        if (!user) {
            var errObj = {
                code: 404,
                message:"User not found"
            }

            return [errObj, null];
        }else {
            return [null, user];
        }
        
    } catch (err) {
        console.log(err);
        var errObj = {
            code: 500,
            message:'Something went wrong'
        }
        return [errObj,null];
    }
}
async function findByIdAndUpdateRequestSent(sendersId,receiversId) {
    try {
        const user = await User.findByIdAndUpdate(
            sendersId,
            {
                $addToSet:{requestSent : receiversId}
            },
            {new:true}
        );
        if (!user) {
            var errObj = {
                code: 404,
                message:"User not found"
            }

            return [errObj, null];
        }else {
            return [null, user];
        }
        
    } catch (err) {
        console.log(err);
        var errObj = {
            code: 500,
            message:'Something went wrong'
        }
        return [errObj,null];
    }
}

async function findUserById(userId) {
    try {
        const user = await User.findOne({ _id:userId });
        if (!user) {
            var errObj = {
                code: 404,
                message:"User not found"
            }

            return [errObj, null];
        }
        
        else {
            return [null, user];
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
 
async function  findUserByEmail(email)  {
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
    }
    catch (err) {
        console.log(err);
        var errObj = {
            code: 500,
            message: "Internal server error"
        };
        return [errObj, null]; 
    }
}

module.exports = {
    findUserByEmail,
    findUserById,
    findByIdAndUpdateRequestSent,
    findByIdAndUpdateRequestReceived,
    findAllReceivedFriendReq,
    findAllSentFriendReq,
    findIfTheyAreFriends
}