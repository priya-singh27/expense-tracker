const { areFriends, findUserById, findUserByEmail } = require('../repository/user.repository');
const SplitBill = require('../model/splitBill');
const User = require('../model/user');
const splitBill = require('../Joi/splitBill');
const mongoose=require('mongoose')


async function addMyAmount(userId,billId,myAmount) {
    try {
        const bill = await SplitBill.findById(billId).populate('participants');
        if (!bill ) {
            var errObj = {
                code: 404,
                message: 'No bill found'
            }
            return [errObj, null];
        }

        const participant = bill.participants.find(participant => participant.participant.equals(userId));
        if (participant) {
            participant.amount = myAmount;
            await bill.save();
        } else {
            let errObj = {
                code: 400,
                message:'Participant not found in the bill'
            }
            return [errObj, null];
        }
        
        const billObjectId = new mongoose.Types.ObjectId(billId);
        const totalAmount = bill.totalAmount;
        try {
            const leftOutAmountResult = await SplitBill.aggregate([
                {
                    $match: { _id: billObjectId }
                },
                {
                    $addFields: {
                        debug_bill:"$$ROOT", // Output the matched document
                    }
                },
                {
                    $project: {
                        totalParticipantAmount: { $sum: '$participants.amount' }
                    }
                },
                {
                    $addFields: {
                        debug_totalParticipantAmount: "$totalParticipantAmount"// Print totalParticipantAmount
                    }
                },
                
                {   
                    $project: {
                        leftOutAmount: {
                            $subtract: [totalAmount, '$totalParticipantAmount']
                        }
                    }
                    
                },
                {
                    $addFields: {
                        debug_leftOutAmount: "$leftOutAmount" // Print leftOutAmount
                    }
                }
                
            ]);
            console.log(leftOutAmountResult);
            if (leftOutAmountResult.length>0) {
                bill.leftOutAmount = leftOutAmountResult[0].leftOutAmount;
                await bill.save();
            } else {
                let errObj = {
                    code: 500,
                    message:'No leftOutAmountResult'
                }
                return [errObj, null];
            }
            
        } catch (err) {
            console.log(err);
            let errObj = {
                code: 500,
                message:'Error in aggregation pipeline'
            }
            return [errObj, null];
        }

        return [null, bill]; 
    }
    catch (err) {
        console.log(err);
        let errObj = {
            code: 500,
            message:'Something went wrong'
        }
        return [errObj, null];
    }
}
 
async function addCreatedSplitBillToEachParticipants(participants,newSplitBill,creatorId) {
    try {

        await Promise.all(

            participants.map(async participantObj => {

                const participantId = participantObj.participant;
                
                const [err, user] = await findUserById(participantId);
                if (err) {
                    if (err.code === 404) return [err.code, null];
                    if (err.code === 500) return [err.code, null];
                }

                const [error, answer] = await areFriends(creatorId, participantId);
                if (error) {
                    if (error.code === 404) return [error.code, null];
                    if (error.code === 500) return [error.code, null];
                }
               
                user.splitBills.push(newSplitBill._id);
                await user.save();
                
            })
        );


        return [null, 'Successfully added participants'];

    } catch (err) {
        console.log(err);
        let errObj = {
            code: 500,
            message:'Something went wrong'
        }
        return [errObj, null];
    }
}

module.exports = {
    addCreatedSplitBillToEachParticipants,
    addMyAmount

}