import mongoose from "mongoose";
import serviceModel from "./service.model.js";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

reviewSchema.index({ user: 1, service: 1 }, { unique: true });

reviewSchema.statics.recalculateServiceRating = async function recalculateServiceRating(serviceId) {
  const stats = await this.aggregate([
    { $match: { service: new mongoose.Types.ObjectId(serviceId) } },
    {
      $group: {
        _id: "$service",
        averageRating: { $avg: "$rating" },
        numReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await serviceModel.findByIdAndUpdate(serviceId, {
      rating: Number(stats[0].averageRating.toFixed(1)),
      numReviews: stats[0].numReviews,
    });
  } else {
    await serviceModel.findByIdAndUpdate(serviceId, {
      rating: 0,
      numReviews: 0,
    });
  }
};

const reviewModel = mongoose.model("Review", reviewSchema);

export default reviewModel;
