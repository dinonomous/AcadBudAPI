const mongoose = require("mongoose");
import { db } from "../config/dbManager";

const likeSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
  users: { type: [String], default: [] },
});

likeSchema.index({ itemId: 1, "users": 1 }, { unique: true });

const Like = db.model("Like", likeSchema);

export default Like