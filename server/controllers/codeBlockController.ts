import { Request, Response, RequestHandler } from "express";
import CodeBlock from "../models/CodeBlock";
import { rooms } from "../app";

export const getAllCodeBlocks: RequestHandler = async (req, res) => {
  try {
    const codeBlocks = await CodeBlock.find();
    res.status(200).json(codeBlocks);
  } catch (error) {
    console.error("❌ Failed to get code blocks:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getCodeBlockById: RequestHandler = async (req, res): Promise<void> => {
  try {
    const block = await CodeBlock.findById(req.params.id);
    if (!block) {
      res.status(404).json({ message: "Not found" });
      return;
    }
    res.status(200).json(block);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getActiveCodeBlocks = (req: Request, res: Response) => {
  const activeIds = Object.entries(rooms)
    .filter(([roomId, room]) => room.mentorId && room.participants.has(room.mentorId))
    .map(([roomId]) => roomId);

  res.status(200).json(activeIds);
};