
const mongoose = require("mongoose");

const splitBillSchema = new mongoose.Schema({
  title: String, 
  participants: [
    {
      participant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      amount: {
        type: Number,
        default:0
      }
    },
    //while comparing for participant amount to totalAmount of bill we are going to use mongo "aggregation pipeline"
  ],
  totalAmount: Number, 
  leftOutAmount: {
    type: Number,
    default: function () {
      return this.totalAmount;
    }
  },
  splitBillMethodology: {
    type: String,
    enum:['Custom','Equally']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"User"
  }
});

const SplitBill = mongoose.model("SplitBill", splitBillSchema);

module.exports = SplitBill;
