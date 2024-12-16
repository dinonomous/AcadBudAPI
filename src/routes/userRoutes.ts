import express from "express";
import { Attendance } from "../controllers/Attendance";
import { TimeTable } from "../controllers/timetable";
import { Calender } from "../controllers/calender";
import { UnifiedTimeTable } from "../controllers/UnifiedTimeTable";
import { Order } from "../controllers/dayorder";
import { getAllByCategory, addLike } from "../controllers/recomendations"
import { fetchWebsiteMetadata, confirmWebsiteMetadata } from "../controllers/linkRegister"; 
const router = express.Router();

router.post("/attendance", Attendance);
router.post("/timetable", TimeTable);
router.post("/calender", Calender);
router.post("/unifiedtimetable", UnifiedTimeTable);
router.post("/order", Order);
router.post("/recomendations/:userId", getAllByCategory);
router.post("/fetch-metadata", fetchWebsiteMetadata);
router.post("/confirm-metadata", confirmWebsiteMetadata);
router.post("/like/:itemId/:userId", addLike);

export default router;
