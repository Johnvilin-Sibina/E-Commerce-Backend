import mongoose from "mongoose";

const paymentsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Orders",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["Credit Card", "Debit Card", "UPI", "Net Banking"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Success", "Failed", "Pending"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

const Payments = mongoose.model("Payments", paymentsSchema);
export default Payments;
