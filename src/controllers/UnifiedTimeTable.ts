import axios from "axios";
import { Request, Response } from "express";
import * as cheerio from "cheerio";

interface TimeTableEntry {
  day: string;
  periods: Array<{
    period: string;
    timeSlot: string;
  }>;
}

function decodeEncodedString(encodedString: string): string {
  return encodedString.replace(
    /\\x([0-9A-Fa-f]{2})/g,
    (match: string, p1: string) => String.fromCharCode(parseInt(p1, 16))
  );
}

function extractTextBetweenWords(
  text: string,
  startWord: string,
  endWord: string
) {
  const startIndex = text.indexOf(startWord);
  const endIndex = text.indexOf(endWord);

  if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
    return text.substring(startIndex + startWord.length, endIndex).trim();
  } else {
    return null;
  }
}

export async function UnifiedTimeTable(req: Request, res: Response) {
  try {
    const batch = req.query.batch;
    const batchNumber = parseInt(batch as string, 10);

    if (!batch) {
      return res.status(400).send({ error: "Batch number is required" });
    }

    let UnifiedTimeTableResponse;

    const cookies = (req as any).session?.cookies || "";
    if (batchNumber === 1) {
      const unifiedTimeTableUrl = `https://academia.srmist.edu.in/srm_university/academia-academic-services/page/Unified_Time_Table_2024_Batch_1`;
      UnifiedTimeTableResponse = await axios.get(unifiedTimeTableUrl, {
        headers: {
          Accept: "*/*",
          Cookie: cookies,
          Host: "academia.srmist.edu.in",
          Origin: "https://academia.srmist.edu.in",
          Referer: "https://academia.srmist.edu.in/",
        },
      });
    } else {
      const unifiedTimeTableUrl = `https://academia.srmist.edu.in/srm_university/academia-academic-services/page/Unified_Time_Table_2024_batch_2`;
      UnifiedTimeTableResponse = await axios.get(unifiedTimeTableUrl, {
        headers: {
          Accept: "*/*",
          Cookie: cookies,
          Host: "academia.srmist.edu.in",
          Origin: "https://academia.srmist.edu.in",
          Referer: "https://academia.srmist.edu.in/",
        },
      });
    }
    if (
      UnifiedTimeTableResponse.status === 200 &&
      UnifiedTimeTableResponse.data
    ) {
      const decodedHTML = decodeEncodedString(UnifiedTimeTableResponse.data);
      const result = extractTextBetweenWords(
        decodedHTML,
        "</style>\n",
        "');function doaction(recType) { }</script>"
      );
      if (result) {
        const $ = cheerio.load(result);
        const timeTableEntries: TimeTableEntry[] = [];

        $("tr").each((index, element) => {
          const cells = $(element).find("td");

          if (cells.length > 0) {
            const day = $(cells[0]).text().trim();

            if (day.startsWith("Day")) {
              const periods: { period: string; timeSlot: string }[] = [];

              cells.each((i, cell) => {
                if (i > 0) {
                  const period = $(cell).text().trim();
                  const timeSlot = $("tr:first-child > td").eq(i).text().trim();

                  periods.push({
                    period: period,
                    timeSlot: timeSlot,
                  });
                }
              });

              timeTableEntries.push({
                day,
                periods,
              });
            }
          }
        });

        res.status(200).json(timeTableEntries);
      } else {
        res.status(404).json({ error: "Element not found" });
      }
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Error fetching attendance data" });
  }
}