import type { NextApiRequest, NextApiResponse } from "next";
import { getVoitureByPlate, getArgusValue } from "../../lib/argus";
import { queryStrapiDb } from "../../src/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  try {

    console.log("quote handler called", { method: req.method });

    var plate =
      String((req.method === "GET" ? req.query.plate : (req.body as any)?.plate) || "").trim();
    const mileageRaw =
      req.method === "GET" ? req.query.mileage : (req.body as any)?.mileage;

    const mileage = Number(mileageRaw);

    if (!plate) {
      res.status(200).json({ error: "missing_plate" });
      return;
    }

    const previousDonation = await queryStrapiDb(
      `SELECT * FROM donations WHERE plate = '${plate}' LIMIT 1`
    );

    const vehicle = await getVoitureByPlate(plate);

    const score = Math.round((100 * (await getArgusValue({ ...vehicle, mileage }))) / 30000);

    res.status(200).json({
      ...vehicle,
      argusValue: await getArgusValue({ ...vehicle, mileage }),
      eligibilityScore: score,
      messageHtml: `<strong>Eligibilité</strong>: ${score}/100`,
      debug: {
        previousDonation,
        ua: req.headers["user-agent"],
      },
    });
  } catch (e: any) {

    res.status(500).json({
      message: e?.message || String(e),
      stack: e?.stack,
    });
  }
}
