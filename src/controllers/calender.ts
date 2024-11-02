import axios from "axios";
import { Request, Response } from "express";
import * as cheerio from "cheerio";

// Define TimetableRow type
interface TimetableRow {
  Date: string;
  Day: string;
  DayOrder: string;
  Event: string;
}

// Function to decode encoded strings
function decodeEncodedString(encodedString: string): string {
  return encodedString.replace(
    /\\x([0-9A-Fa-f]{2})/g,
    (match: string, p1: string) => String.fromCharCode(parseInt(p1, 16))
  );
}

// Function to get calendar data
export async function Calender(req: Request, res: Response) {
  try {
    const cookies = (req as any).session?.cookies || "";

    // Fetch data from the target URL
    const timetableResponse = await axios.get(
      "https://academia.srmist.edu.in/srm_university/academia-academic-services/page/Academic_Planner_2024_25_ODD",
      {
        headers: {
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          Cookie: cookies,
          Host: "academia.srmist.edu.in",
          Origin: "https://academia.srmist.edu.in",
          Referer: "https://academia.srmist.edu.in/",
        },
      }
    );

    if (timetableResponse.status === 200 && timetableResponse.data) {
      const decodedHTML = decodeEncodedString(timetableResponse.data);
      const $ = cheerio.load(decodedHTML);
      const tables = $("table");

      if (tables.length > 0) {
        const response: { [month: string]: TimetableRow[] } = {};
        const monthData = [
          { month: "June", index: [0, 1, 2, 3] },
          { month: "July", index: [5, 6, 7, 8] },
          { month: "August", index: [10, 11, 12, 13] },
          { month: "September", index: [15, 16, 17, 18] },
          { month: "October", index: [20, 21, 22, 23] },
          { month: "November", index: [25, 26, 27, 28] },
          { month: "December", index: [30, 31, 32, 33] },
        ];

        tables.each((_, table) => {
          $(table)
            .find("tr")
            .each((_, row) => {
              const cells = $(row)
                .find("td")
                .toArray()
                .map((cell) => $(cell).text().trim());

              // Process only rows with the necessary number of cells
              if (cells.length >= 34) {
                monthData.forEach(({ month, index }) => {
                  const [dateIndex, dayIndex, eventIndex, dayOrderIndex] =
                    index;
                  const date = cells[dateIndex] || "";
                  const day = cells[dayIndex] || "";
                  const event = cells[eventIndex] || "";
                  const dayOrder = cells[dayOrderIndex] || "";

                  // Only create entries with valid data
                  if (date || event) {
                    if (!response[month]) response[month] = [];
                    response[month].push({
                      Date: date,
                      Day: day,
                      DayOrder: dayOrder,
                      Event: event,
                    });
                  }
                });
              }
            });
        });

        res.status(200).json(response);
      } else {
        res.status(404).json({ error: "Timetable data not found" });
      }
    } else {
      res
        .status(timetableResponse.status)
        .json({ error: "HTML content not found or request failed" });
    }
  } catch (error) {
    console.error("Error fetching timetable data:", error);
    res.status(500).send({ message: "Error fetching timetable data" });
  }
}
