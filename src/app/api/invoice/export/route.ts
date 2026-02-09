export const runtime = "nodejs";

import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

import { NextResponse } from "next/server";

export async function POST(req: Request) {

  try {

    const invoice = await req.json();

    const templatePath = path.join(
      process.cwd(),
      "public",
      "invoice",
      "template.html"
    );

    let html = fs.readFileSync(templatePath, "utf8");

    const itemsHTML = `
      <tr>
        <td>${invoice.projects?.name || "Service"}</td>
        <td>1</td>
        <td>₹${invoice.total}</td>
        <td>₹${invoice.total}</td>
      </tr>
    `;

    html = html
      .replaceAll("{{invoice_number}}", invoice.invoice_number || "")
      .replaceAll("{{issue_date}}", invoice.issue_date || "")
      .replaceAll("{{client_name}}", invoice.clients?.name || "")
      .replaceAll("{{client_address}}", invoice.clients?.address || "")
      .replaceAll("{{amount}}", invoice.total?.toString() || "0")
      .replaceAll("{{items}}", itemsHTML);

    // Connect to remote chromium
    const browser = await puppeteer.connect({

      browserWSEndpoint:
        process.env.BROWSERLESS_URL!

    });

    const page = await browser.newPage();

    await page.setContent(html, {

      waitUntil: "networkidle0",

    });

    const pdf = await page.pdf({

      format: "A4",

      printBackground: true,

    });

    await browser.close();

    return new NextResponse(Buffer.from(pdf), {

      headers: {

        "Content-Type": "application/pdf",

        "Content-Disposition":
          `attachment; filename=${invoice.invoice_number}.pdf`,

      },

    });

  }

  catch (error) {

    console.error(error);

    return NextResponse.json({

      error: "PDF failed",

    }, { status: 500 });

  }

}
