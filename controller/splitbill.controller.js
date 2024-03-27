const SplitBill = require('../model/splitBill');
const { findIfTheyAreFriends, findUserById } = require('../repository//user.repository');
const joi_schema = require('../Joi/splitBill/index');
const {badRequestResponse,notFoundResponse,serverErrorResponse,successResponse,unauthorizedResponse,handle304 } = require('../utils/response');
const User = require('../model/user');

const createSplitBill = async (req, res) => {
    try {
        const userId = req.user._id;
        const { error } = joi_schema.createSplitBill.validate(req.body);
        if (error) {
            return badRequestResponse(res,'Invalid data entered')
        }
        const newSplitBill = new SplitBill({
            title: req.body.title,
            participants: req.body.participants,
            amount: req.body.amount,
            splitAmount: req.body.splitAmount,
            discription:req.body.discription
            
        });

        const participantIds = req.body.participants;
        for (const participantId of participantIds) {
            const [err, friends] = await findIfTheyAreFriends(participantId, userId);
            if (err) {
                if (err.code == 404) {
                    return badRequestResponse(res,'Error in adding participant who is not in friends list');
                }
                if (err.code == 500) {
                    return serverErrorResponse(res, 'Something Went Wrong');
                }
            }

            const [error, participant] = await findUserById(participantId);
            if (error) {
                if (error.code == 404) {
                    return badRequestResponse(res,'Error in adding participant who is not in friends list');
                }
                if (error.code == 500) {
                    return serverErrorResponse(res, 'Something Went Wrong');
                }
            }

            participant.splitBill.push(newSplitBill._id);
            await participant.save();

        }
        

        const [err, user] = await findUserById(userId);
        
        user.splitBill.push(newSplitBill._id);

        await user.save();

        newSplitBill.participants.push(userId);
        await newSplitBill.save();
        
        return successResponse(res, newSplitBill, 'Participants have been added successfully');
    } catch (err) {
        console.log(err);
        return serverErrorResponse(res, 'Something Went Wrong');
    }

}

module.exports = {
    createSplitBill
}
// const addParticipants = async (req, res) => {
//     try {
//         const userId = req.user._id;
//         const participantIds = req.body.participants;
        
//         const { error } = joi_schema.createExpense.validate(req.body);
//         if ( error) {
//             return badRequestResponse(res, 'Bad Request');
//         }

//         const participantsArray = [];
//         const user = await User.findById(userId).populate('friends');
       
//         for (const participantId of participantIds) {

//             if (!mongoose.Types.ObjectId.isValid(participantId)) {
//                 return badRequestResponse(res, 'Invalid id provided');
//             }

//             const [err, participant] = await findUserById(participantId);

//             if (err) {
//                 if (err.code == 404) {
//                     return notFoundResponse(res, 'participan not found');
//                 }
//                 if (err.code == 500) {
//                     return serverErrorResponse(res, 'Something went wrong');
//                 }
//             }

//             const userInFriends = user.friends.find(user => user._id.equals(participantId));
            
//             if (!userInFriends) {
//                 return badRequestResponse(res, 'Not in friends');
//             }
            
//             participantsArray.push(participant._id);

//         }
        
//         //If data entered is correct save in db
//         const newExpense = new Expense({
//             title: req.body.title,
//             amount: req.body.amount,
//             date: req.body.date,
//             category: req.body.category,
//             participants:participantsArray
//         });

//         user.expenses.push(newExpense);

//         for (id of participantsArray) {
//             const eachUser = await User.findById(id).populate();
//             eachUser.expenses.push(newExpense);
//             await eachUser.save();
//         }
        
//         await newExpense.save();
//         await user.save();

//         return successResponse(res, newExpense, 'Expense added');

//     }
//     catch (err) {
//         console.log(err);
//         return serverErrorResponse(res, 'Something Went Wrong');
//     }
// }