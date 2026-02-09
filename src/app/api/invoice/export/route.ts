export const runtime = "nodejs";

import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

import { createClient } from "@supabase/supabase-js";


// Supabase server client

const supabase =
  createClient(

    process.env.NEXT_PUBLIC_SUPABASE_URL!,

    process.env.SUPABASE_SERVICE_ROLE_KEY!

  );


export async function POST(req: Request) {

  try {

    const { invoiceId } =
      await req.json();



    // Fetch full invoice with relations

    const { data: invoice, error }
      = await supabase
        .from("invoices")
        .select(`
          *,
          clients(*),
          projects(*),
          invoice_items(*)
        `)
        .eq("id", invoiceId)
        .single();


    if (error || !invoice) {

      throw new Error(
        "Invoice not found"
      );

    }



    // Load template

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
        "utf-8"
      );



    // Build items HTML from real invoice_items

    const itemsHTML =
      invoice.invoice_items
        ?.map(
          (item: any) => `
            <tr>
              <td>${item.description}</td>
              <td>${item.quantity}</td>
              <td>₹${item.unit_price}</td>
              <td>₹${item.total}</td>
            </tr>
          `
        )
        .join("")
      || "";



    // Replace placeholders

    html = html

      .replaceAll(
        "{{invoice_number}}",
        invoice.invoice_number
      )

      .replaceAll(
        "{{issue_date}}",
        new Date(
          invoice.issue_date
        ).toLocaleDateString("en-IN")
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



    // Launch Puppeteer

    const browser =
      await puppeteer.launch({

        headless: true,

        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox"
        ],

      });


    const page =
      await browser.newPage();



    // Load HTML

    await page.setContent(
      html,
      {
        waitUntil:
          "networkidle0"
      }
    );



    // Fix image loading

    await page.evaluate(() => {

      const base =
        document.createElement("base");

      base.href =
        "http://localhost:3000/invoice/";

      document.head.appendChild(base);

    });



    // Generate PDF
    await page.evaluateHandle('document.fonts.ready');

    const pdf =
      await page.pdf({

        width: "210mm",
        height: "297mm",

        printBackground: true,
        preferCSSPageSize: true,

      });



    await browser.close();



    return new NextResponse(

      Buffer.from(pdf),

      {

        status: 200,

        headers: {

          "Content-Type":
            "application/pdf",

          "Content-Disposition":
            `attachment; filename=${invoice.invoice_number}.pdf`,

        },

      }

    );

  }

  catch (error) {

    console.error(
      "PDF generation error:",
      error
    );

    return NextResponse.json(

      {
        error:
          "Failed to generate PDF",
      },

      {
        status: 500,
      }

    );

  }

}
