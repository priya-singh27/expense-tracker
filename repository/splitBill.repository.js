const { areFriends, findUserById, findUserByEmail } = require('../repository/user.repository');
const SplitBill = require('../model/splitBill');
const User = require('../model/user');

// async function updateBill(billId,updatedParticipants) {
//     try {
//         const existingBill = await SplitBill.findById(billId);
//         if (!existingBill) {
//             var errObj = {
//                 code: 404,
//                 message:'Bill not found'
//             }
//             return [errObj, null];
//         }
        
//         const participantsInExistingBill = existingBill.participants;

//         console.log("participantInExistingBill" + " " + participantsInExistingBill);
//         console.log("updatedParticipants"+" "+updatedParticipants);

//         const participantsAdded = updatedParticipants.filter(id => !participantsInExistingBill.includes(id.toString()));
//         const particpantsRemoved = participantsInExistingBill.filter(id => !updatedParticipants.includes(id.toString()));
//         // const participantsUnchanged = participantsInExistingBill.filter(id => updateSplitBill.includes(id));

//         console.log("participantsAdded" + " " + participantsAdded);
//         console.log("particpantsRemoved" + " " + particpantsRemoved);

//         if (participantsAdded.length > 0) {
//             for (var participantId of participantsAdded) {
//                 const [err, user] = await findUserById(participantId);
//                 if (err) {
//                     return [err.code, null];
//                 }
//                 user.splitBills.push(existingBill._id);
//                 await user.save();
//             }
//         }
//         if (particpantsRemoved.length > 0) {
//             for (var participantId of particpantsRemoved) {
//                 const [err, user] = await findUserById(participantId);
//                 if (err) {
//                     return [err.code, null];
//                 }
//                 // const participant = await User.findById(participantId).populate('splitBills');
//                 const bill = user.splitBills.find(bill => bill.equals(billId));
//                 user.splitBills.pull(bill);
//                 await user.save();
//             }
//         }

//         return [null, 'success'];

//     } catch (err) {
//         console.log(err);
//         var errObj = {
//             code: 500,
//             message:'Something went wrong'
//         }
//         return [errObj, null];
//     }
// }


// async function findSplitBillById(billId) {
//     try {
//         const bill = await SplitBill.findById(billId);
//         if (!bill) {
//             var errObj = {
//                 code: 404,
//                 message:'Bill not found'
//             }
//             return [errObj, null];
//         }
//         return [null, bill];
//     }
//     catch (err) {
//         console.log(err);
//         var errObj = {
//             code: 500,
//             message:'Something went wrong'
//         }
//         return [errObj, null];
//     }
// }



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
    // findSplitBillById,
    // updateBill
}