const { addCreatedSplitBillToEachParticipants,addMyAmount,updateBillById} = require('../repository/splitBill.repository');
const mongoose = require('mongoose');
const SplitBill = require('../model/splitBill');
const { findIfTheyAreFriends, findUserById } = require('../repository//user.repository');
const joi_schema = require('../Joi/splitBill/index');
const {badRequestResponse,notFoundResponse,serverErrorResponse,successResponse,unauthorizedResponse,handle304 } = require('../utils/response');
const User = require('../model/user');
const splitBill = require('../Joi/splitBill/index');

const updateBill = async (req, res) => {
    try {

        const { error } = joi_schema.createSplitBill.validate(req.body);
        if (error) {
            return badRequestResponse(res, 'invalid data entered');
        }
        
        const { title, participants, totalAmount, splitBillMethodology } = req.body;


        const userId = req.user._id;
        const billId = req.params.id;
        
        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(billId)) {
            return badRequestResponse(res, 'Invalid id');
        }

        const [err, bill] = await updateBillById(userId, billId, title, participants, totalAmount, splitBillMethodology);
        if (err) {
            if (err.code == 404) {
                return notFoundResponse(res, 'Either user or bill not found');
            }
            if (err.code == 500) {
                return serverErrorResponse(res, 'Error in updating bill');
            }
        }
        
        return successResponse(res,bill,"Updated")
    }
    catch (err) {
        console.log(err);
        return serverErrorResponse(res, "something went wrong");
    }
}

const addAmount = async (req, res) =>{
    try {
        const { error } = joi_schema.addAmount.validate(req.body);
        if (error) {
            return badRequestResponse(res, 'Invalid data entered');
        }

        const userId = req.user._id;
        const billId = req.params.id;

        const [err, bill] = await addMyAmount(userId, billId,req.body.amount);
        if (err) {
            if (err.code == 400) {
                return badRequestResponse(res, 'Bad Request In controller');
            }
            if (err.code == 404) {
                return notFoundResponse(res, 'No bill found');
            }

            if (err.code == 500) {
                return serverErrorResponse(res, err.message);
            }
        }

        return successResponse(res, bill, 'Your amount has been added successfully');
        
    }
    catch (err) {
        console.log(err);
        return serverErrorResponse(res, 'Something went wrong In controller');
    }
}

const addCreatorAsParticipant = async (req, res) => {
    try {

        const userId = req.user._id;

        const billId = req.params.id;
        
        const user = await User.findById(userId).populate('splitBills');
        if (!user) {
            return badRequestResponse(res, 'Bad request');
        }
        const bill = user.splitBills.find(bill => bill._id.equals(billId));
        if (!bill) {
            return badRequestResponse(res, 'Bill not found');
        }

        const ceratorParticipant = bill.participants.find(participant => participant.participant.equals(userId));
        if (ceratorParticipant) {
            return badRequestResponse(res, 'You are already a participant in this bill.');
        }

        bill.participants.push({
            participant: userId,
            amount:0
        });

        await bill.save();

        return successResponse(res, bill, 'Creator added as participant successfully');
        
    } catch (err) {
        console.log(err);
        return serverErrorResponse(res, 'Something went wrong');
    }
}

const addParticipants = async (req, res) => {
    try {
        const userId = req.user._id;
        const { error } = joi_schema.createSplitBill.validate(req.body);
        if (error) {
            return badRequestResponse(res,'Invalid data entered')
        }

        const { title, participants, totalAmount, splitBillMethodology } = req.body;

        const newSplitBill = new SplitBill({
            title,
            participants,
            totalAmount,
            splitBillMethodology,
            leftOutAmount: totalAmount,
            createdBy:userId
        });

        await newSplitBill.save();

        // const [err, user] = await findUserById(userId);
        // if (err) {
        //     if (err.code == 404) return notFoundResponse(res, 'User not found');
        //     if (err.code == 500) return serverErrorResponse(res, 'Something went wrong');
        // }

        // user.splitBills.push(newSplitBill._id);
        // await user.save();

     

        const [Error,message]=await addCreatedSplitBillToEachParticipants(participants, newSplitBill, userId);
        if (Error) {
            if (Error.code == 404) return notFoundResponse(res, 'Either user not found or you are not in their friends list');
            if (Error.code == 500) return serverErrorResponse(res, 'Something went wrong');
        }


        
        // const [err, user] = await findUserById(userId);
        // if (err) {
        //     if (err.code == 404) return notFoundResponse(res, 'User not found');
        //     if (err.code == 500) return serverErrorResponse(res, 'Something went wrong');
        // }
        // user.splitBills.push(newSplitBill._id);

        // await user.save();

        // newSplitBill.participants.push(userId);//newSplitBill in db will have all the participants exept user who creadted this so here adding user._id
        
        return successResponse(res, newSplitBill, message);
    } catch (err) {
        console.log(err);
        return serverErrorResponse(res, 'Something Went Wrong');
    }

}

module.exports = {
    addParticipants,
    addCreatorAsParticipant,
    addAmount,
    updateBill
}
