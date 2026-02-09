export const runtime = "nodejs";

import fs from "fs";
import path from "path";
import puppeteer from "puppeteer-core";
import { NextResponse } from "next/server";

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {

  try {

    const { invoiceId } = await req.json();

    if (!invoiceId) {
      throw new Error("invoiceId required");
    }

    /*
    ===============================
    FETCH INVOICE + ITEMS
    ===============================
    */

    const { data: invoice, error } =
      await supabase
        .from("invoices")
        .select(`
          *,
          clients (
            name,
            address
          ),
          projects (
            name
          ),
          invoice_items (
            description,
            quantity,
            unit_price,
            total
          )
        `)
        .eq("id", invoiceId)
        .single();

    if (error || !invoice) {
      throw new Error("Invoice not found");
    }

    /*
    ===============================
    LOAD TEMPLATE
    ===============================
    */

    const templatePath =
      path.join(
        process.cwd(),
        "public",
        "invoice",
        "template.html"
      );

    let html =
      fs.readFileSync(
        templatePath,
        "utf8"
      );

    /*
    ===============================
    EMBED LOGO + BG (CRITICAL FIX)
    ===============================
    */

    const logoPath =
      path.join(
        process.cwd(),
        "public",
        "invoice",
        "logo.png"
      );

    const bgPath =
      path.join(
        process.cwd(),
        "public",
        "invoice",
        "bg.png"
      );

    const logoBase64 =
      fs.readFileSync(logoPath)
        .toString("base64");

    const bgBase64 =
      fs.readFileSync(bgPath)
        .toString("base64");

    html = html
      .replace(
        'src="/invoice/logo.png"',
        `src="data:image/png;base64,${logoBase64}"`
      )
      .replace(
        "url('/invoice/bg.png')",
        `url('data:image/png;base64,${bgBase64}')`
      );

    /*
    ===============================
    BUILD ITEMS HTML
    ===============================
    */

    const itemsHTML =
      invoice.invoice_items
        ?.map(
          (item: any) => `
            <tr>
              <td>${item.description}</td>
              <td>${item.quantity}</td>
              <td>₹${Number(item.unit_price).toLocaleString("en-IN")}</td>
              <td>₹${Number(item.total).toLocaleString("en-IN")}</td>
            </tr>
          `
        )
        .join("") || "";

    /*
    ===============================
    FORMAT DATE
    ===============================
    */

    const issueDate =
      invoice.issue_date
        ? new Date(invoice.issue_date)
            .toLocaleDateString("en-IN")
        : "";

    /*
    ===============================
    REPLACE VARIABLES
    ===============================
    */

    html = html
      .replaceAll(
        "{{invoice_number}}",
        invoice.invoice_number || ""
      )
      .replaceAll(
        "{{issue_date}}",
        issueDate
      )
      .replaceAll(
        "{{client_name}}",
        invoice.clients?.name || ""
      )
      .replaceAll(
        "{{client_address}}",
        invoice.clients?.address || ""
      )
      .replaceAll(
        "{{amount}}",
        Number(invoice.total)
          .toLocaleString("en-IN")
      )
      .replaceAll(
        "{{items}}",
        itemsHTML
      );

    /*
    ===============================
    CONNECT TO BROWSERLESS
    ===============================
    */

    const browser =
      await puppeteer.connect({

        browserWSEndpoint:
          process.env.BROWSERLESS_URL!

      });

    const page =
      await browser.newPage();

    await page.setContent(
      html,
      {
        waitUntil: "domcontentloaded",
        timeout: 0
      }
    );

    const pdf =
      await page.pdf({

        format: "A4",

        printBackground: true,

        margin: {
          top: "0px",
          right: "0px",
          bottom: "0px",
          left: "0px"
        }

      });

    await browser.close();

    /*
    ===============================
    RETURN PDF
    ===============================
    */

    return new NextResponse(
      Buffer.from(pdf),
      {

        headers: {

          "Content-Type":
            "application/pdf",

          "Content-Disposition":
            `attachment; filename=${invoice.invoice_number}.pdf`,

        },

      }
    );

  }

  catch (err) {

    console.error(
      "PDF generation error:",
      err
    );

    return NextResponse.json(
      { error: "PDF failed" },
      { status: 500 }
    );

  }

}
