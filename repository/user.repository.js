const mongoose = require('mongoose');
const User = require('../model/user');

async function isRequestSent(sendersId,receiversId) {
    try {
        const sender = await User.findById(sendersId);
        const receiverInSentReq = sender.requestSent.find(user => user._id.equals(receiversId));
        
        if (receiverInSentReq) {
            return [null, receiverInSentReq];
        }
        let errObj = {
            code: 404,
            message:'Bad Request'
        }
        return [errObj, null];
    } catch (err) {
        console.log(err);
        let errObj = {
            code: 500,
            message:'Something went wrong'
        }

        return [errObj, null];
    }

}

async function areTheyFriend(sendersId,receiversId) {
    try {
        if (!mongoose.Types.ObjectId.isValid(sendersId) || !mongoose.Types.ObjectId.isValid(receiversId)) {
            let errObj = {
                code: 400,
                message:"invalid user id"
            }
            return [errObj, null];
        }

        if (sendersId===receiversId){ 
            return [null, true];   
        }

        const sender = await User.findById(sendersId).populate('friends');
        if (!sender) {
            let errObj = {
                code: 404,
                message:'User not found'
            }
            return [errObj, false];
        }
        
        const receiver = sender.friends.find(user => user._id.equals(receiversId));
        if (!receiver) {
            let errObj = {
                code: 404,
                message:'User not found'
            }
            return [errObj, false];
        } else {
            return [null, true];
            
        }

    } catch (err) {
        console.log(err);
        let errObj = {
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
        let errObj = {
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
        let errObj = {
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
            let errObj = {
                code: 404,
                message:"User not found"
            }

            return [errObj, null];
        }else {
            return [null, user];
        }
        
    } catch (err) {
        console.log(err);
        let errObj = {
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
            let errObj = {
                code: 404,
                message:"User not found"
            }

            return [errObj, null];
        }else {
            return [null, user];
        }
        
    } catch (err) {
        console.log(err);
        let errObj = {
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
            let errObj = {
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
        let errObj = {
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
            let errObj = {
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
        let errObj = {
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
    areTheyFriend,
    isRequestSent
}