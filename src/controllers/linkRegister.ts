import axios from "axios";
import cheerio from "cheerio";
import { Request, Response } from "express";
const WebsiteMetadataModel = require('../models/linksModel');
import type { WebsiteMetadata } from "../types/TSconfigTypes";

async function fetchMetadataForUrl(url: string) {
  try {
    const response = await axios.get(url, {
      headers: {
        Accept: "*/*",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    if (response.status === 200 && response.data) {
      const html = response.data;
      const $ = cheerio.load(html);

      const metadata = {
        url,
        title: $('meta[property="og:title"]').attr("content") || $("title").text() || "No title available",
        description:
          $('meta[property="og:description"]').attr("content") ||
          $('meta[name="description"]').attr("content") ||
          "No description available",
        logo:
          $('meta[property="og:image"]').attr("content") ||
          $('link[rel="icon"]').attr("href") ||
          "No logo available",
      };

      if (metadata.logo && metadata.logo.startsWith("/")) {
        const baseUrl = new URL(url).origin;
        metadata.logo = baseUrl + metadata.logo;
      }

      return metadata;
    }
  } catch (error) {
    console.error(`Error fetching metadata for URL ${url}:`);
    return {
      url,
      error: "Failed to fetch metadata for this website.",
    };
  }
}

export async function fetchWebsiteMetadata(req: Request, res: Response) {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    const metadata = await fetchMetadataForUrl(url);
    res.status(200).json(metadata); 
  } catch (error) {
    console.error("Error fetching website metadata:", error);
    res.status(500).json({ error: "Error fetching website metadata" });
  }
}


export async function confirmWebsiteMetadata(req: Request, res: Response) {
  try {
    const { url, title, author, description, logo, tags, category } = req.body;

    if (!url || !title || !description || !logo || !category || !author) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingWebsite = await WebsiteMetadataModel.findOne({ url });
    if (existingWebsite) {
      return res.status(400).json({ error: "This URL is already registered" });
    }

    const newWebsite = new WebsiteMetadataModel({
      url,
      title,
      author,
      description,
      logo,
      tags,
      category,
    });

    await newWebsite.save();

    res.status(201).json({ message: "Website metadata saved successfully", data: newWebsite });
  } catch (error) {
    console.error("Error saving website metadata:", error);
    res.status(500).json({ error: "Error saving website metadata" });
  }
}
