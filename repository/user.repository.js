const mongoose = require('mongoose');
const User = require('../model/user');

async function isRequestSent(sendersId,receiversId) {
    try {
        const sender = await User.findById(sendersId);
        const receiverInSentReq = sender.requestSent.find(user => user._id.equals(receiversId));
        
        if (receiverInSentReq) {
            return [null, receiverInSentReq];
        }
        var errObj = {
            code: 404,
            message:'Bad Request'
        }
        return [errObj, null];
    } catch (err) {
        console.log(err);
        var errObj = {
            code: 500,
            message:'Something went wrong'
        }

        return [errObj, null];
    }

}

async function areFriends(sendersId,receiversId) {
    try {
        if (!mongoose.Types.ObjectId.isValid(sendersId) || !mongoose.Types.ObjectId.isValid(receiversId)) {
            let errObj = {
                code: 400,
                message:"invalid user id"
            }
            return [errObj, null];
        }
        if (sendersId===receiversId){
            const [error1, receiver] = await User.findById(receiversId);
            if (error1) {
                if (error1.code == 404) {
                    return [error1.code, null];
                }
                if (error1.code == 500) {
                    return [error1.code, null];
                }
            }
            return [null, true];
            
        }
        const sender = await User.findById(sendersId);
        if (!sender) {
            let errObj = {
                code: 404,
                message:'User not found'
            }
            return [errObj, false];
        }
        
        await sender.populate('friends');

        const receiver = sender.friends.find(user => user._id.equals(receiversId));
        if (!receiver) {
            let errObj = {
                code: 404,
                message:'User not found'
            }
            return [errObj, false];
        }

        return [null, true];


    } catch (err) {
        console.log(err);
        var errObj = {
            code: 500,
            message:'Something Went Wrong in repo'
        }
        return [errObj,false];
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
        const user = await User.findById(userId);
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
    areFriends,
    isRequestSent
}