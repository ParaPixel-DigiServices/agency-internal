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
    FETCH INVOICE
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
    BUILD ITEMS HTML
    ===============================
    */

    const itemsHTML =
      invoice.invoice_items
        .map(
          (item: any) => `
          <tr>
            <td>${item.description}</td>
            <td>${item.quantity}</td>
            <td>₹${item.unit_price}</td>
            <td>₹${item.total}</td>
          </tr>
        `
        )
        .join("");

    /*
    ===============================
    FORMAT DATES
    ===============================
    */

    const issueDate =
      new Date(invoice.issue_date)
        .toLocaleDateString("en-IN");

    /*
    ===============================
    REPLACE VARIABLES
    ===============================
    */

    html = html
      .replaceAll(
        "{{invoice_number}}",
        invoice.invoice_number
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
        invoice.total.toString()
      )
      .replaceAll(
        "{{items}}",
        itemsHTML
      );

    /*
    ===============================
    GENERATE PDF
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
        waitUntil: "networkidle0"
      }
    );

    const pdf =
      await page.pdf({

        format: "A4",

        printBackground: true,

      });

    await browser.close();

    /*
    ===============================
    RETURN PDF
    ===============================
    */

    return new NextResponse(Buffer.from(pdf), {

      headers: {

        "Content-Type":
          "application/pdf",

        "Content-Disposition":
          `attachment; filename=${invoice.invoice_number}.pdf`,

      },

    });

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
