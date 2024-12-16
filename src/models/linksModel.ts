const mongoose = require("mongoose");
const {db} = require("../config/dbManager")

const WebsiteMetadataSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    default: "No title available",
    index: true, 
  },
  author: {
    type: String,
    default: "Unknown",
    index: true, 
  },
  description: {
    type: String,
    default: "No description available",
  },
  logo: {
    type: String,
    default: "No logo available",
  },
  likes: {
    type: Number,
    default: 0,
  },
  category: {
    type: String,
    enum: ["By AcadMate", "SRM", "More"],
    default: "Other",
    index: true,
  },
  tags: {
    type: [String],
    default: [],
    index: true, 
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

WebsiteMetadataSchema.index({ title:1, category: 1, tags: 1 });

module.exports = db.model("WebsiteMetadata", WebsiteMetadataSchema);
