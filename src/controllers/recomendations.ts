import { Request, Response } from "express";
import WebsiteMetadataModel from '../models/linksModel';
import type { WebsiteMetadata } from "../types/TSconfigTypes";
import Like from '../models/likesModel'

export async function getAllByCategory(req: Request, res: Response): Promise<void> {
  const userId = req.params.userId;
  
  try {
    const websites = await WebsiteMetadataModel.find();
    
    const categorized = await Promise.all(
      websites.map(async (site: WebsiteMetadata & { toObject: () => Record<string, unknown> }) => {
        const like = await Like.findOne({ itemId: site._id });
        const alreadyLike = like ? like.users.includes(userId) : false;
        
        return {
          ...site.toObject(),
          alreadyLike,
        };
      })
    );

    const categorizedWebsites = categorized.reduce(
      (acc: Record<string, WebsiteMetadata[]>, site: WebsiteMetadata) => {
        acc[site.category] = acc[site.category] || [];
        acc[site.category].push({
          ...site,
          alreadyLike: site.alreadyLike,
        });
        return acc;
      },
      {}
    );

    res.status(200).json(categorizedWebsites);
  } catch (error) {
    res.status(500).json({ error: "Error fetching data by category" });
  }
}

export async function getByTags(req: Request, res: Response): Promise<void> {
  try {
    const { tags } = req.query;
    if (!tags || !Array.isArray(tags)) {
      res.status(400).json({ error: "Invalid or missing tags" });
      return;
    }
    const websites = await WebsiteMetadataModel.find({ tags: { $in: tags } });
    res.status(200).json(websites);
  } catch (error) {
    res.status(500).json({ error: "Error fetching data by tags" });
  }
}

export async function addLike(req: Request, res: Response): Promise<void> {
  const { itemId, userId } = req.params;

  try {
    const updatedLike = await Like.findOneAndUpdate(
      { itemId },
      { $addToSet: { users: userId } },
      { new: true, upsert: true }
    );

    if (updatedLike) {
      res.status(200).json({
        message: "Like added successfully",
        updatedLike,
      });
    } else {
      res.status(400).json({ message: "Failed to add like" });
    }
  } catch (error) {
    console.error("Error adding like:", error);
    res.status(400).json({ error: "Failed to add like" });
  }
}

export async function getLikesForItem (itemId: string) {
  try {
    const like = await Like.findOne({ itemId });
    if (like) {
      return like.users; // Return the array of user IDs who liked the item
    } else {
      console.log("No likes found for this item.");
      return [];
    }
  } catch (error) {
    console.error("Error fetching likes:", error);
    return [];
  }
};
