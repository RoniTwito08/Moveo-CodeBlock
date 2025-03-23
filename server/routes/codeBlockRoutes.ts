import express from "express";
import { getAllCodeBlocks ,getCodeBlockById,getActiveCodeBlocks} from "../controllers/codeBlockController";

const router = express.Router();

router.get("/", getAllCodeBlocks);
router.get("/active", getActiveCodeBlocks);
router.get("/:id", getCodeBlockById);


export default router;
