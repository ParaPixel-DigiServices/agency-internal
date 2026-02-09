export const runtime = "nodejs";

import fs from "fs";
import path from "path";
import puppeteer from "puppeteer-core";
import type { Browser, Page } from "puppeteer-core";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/*
================================
SUPABASE CLIENT
================================
*/

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// Client for authentication verification
const supabaseAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

/*
================================
MAIN EXPORT
================================
*/

export async function POST(req: Request) {
  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    /*
    =================================
    AUTHENTICATION CHECK
    =================================
    */

    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized - No valid token provided" },
        { status: 401 },
      );
    }

    const token = authHeader.replace("Bearer ", "");

    const {
      data: { user },
      error: authError,
    } = await supabaseAuth.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 },
      );
    }

    // Verify email domain
    if (!user.email || !user.email.endsWith("@parapixel.net")) {
      return NextResponse.json(
        { error: "Unauthorized - Access restricted to @parapixel.net users" },
        { status: 403 },
      );
    }

    /*
    =================================
    GET REQUEST DATA
    =================================
    */

    const { invoiceId } = await req.json();

    if (!invoiceId) throw new Error("invoiceId required");

    /*
    =================================
    FETCH INVOICE + ITEMS
    =================================
    */

    const { data: invoice, error } = await supabase
      .from("invoices")
      .select(
        `
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
        `,
      )
      .eq("id", invoiceId)
      .single();

    if (error || !invoice) throw new Error("Invoice not found");

    /*
    =================================
    LOAD TEMPLATE
    =================================
    */

    const templatePath = path.join(
      process.cwd(),
      "public",
      "invoice",
      "template.html",
    );

    let html = fs.readFileSync(templatePath, "utf8");

    /*
    =================================
    EMBED LOGO + BG (REQUIRED)
    =================================
    */

    const logoBase64 = fs
      .readFileSync(path.join(process.cwd(), "public", "invoice", "logo.png"))
      .toString("base64");

    const bgBase64 = fs
      .readFileSync(path.join(process.cwd(), "public", "invoice", "bg.png"))
      .toString("base64");

    html = html
      .replace(
        'src="/invoice/logo.png"',
        `src="data:image/png;base64,${logoBase64}"`,
      )
      .replace(
        "url('/invoice/bg.png')",
        `url('data:image/png;base64,${bgBase64}')`,
      );

    /*
    =================================
    BUILD ITEMS HTML
    =================================
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
      `,
        )
        .join("") || "";

    /*
    =================================
    FORMAT DATE
    =================================
    */

    const issueDate = invoice.issue_date
      ? new Date(invoice.issue_date).toLocaleDateString("en-IN")
      : "";

    /*
    =================================
    REPLACE VARIABLES
    =================================
    */

    html = html
      .replaceAll("{{invoice_number}}", invoice.invoice_number || "")
      .replaceAll("{{issue_date}}", issueDate)
      .replaceAll("{{client_name}}", invoice.clients?.name || "")
      .replaceAll("{{client_address}}", invoice.clients?.address || "")
      .replaceAll("{{amount}}", Number(invoice.total).toLocaleString("en-IN"))
      .replaceAll("{{items}}", itemsHTML);

    /*
    =================================
    CONNECT TO BROWSERLESS (STABLE)
    =================================
    */

    browser = await puppeteer.connect({
      browserWSEndpoint: process.env.BROWSERLESS_URL!,

      defaultViewport: null,
    });

    /*
    CRITICAL: reuse existing page
    prevents 429 errors
    */

    const pages = await browser.pages();

    page = pages.length > 0 ? pages[0] : await browser.newPage();

    /*
    =================================
    LOAD HTML
    =================================
    */

    await page.setContent(html, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    /*
    =================================
    GENERATE PDF
    =================================
    */

    const pdf = await page.pdf({
      format: "A4",

      printBackground: true,

      margin: {
        top: "0",
        right: "0",
        bottom: "0",
        left: "0",
      },
    });

    /*
    =================================
    CLEANUP (IMPORTANT)
    =================================
    */

    await page.close();

    await browser.disconnect();

    /*
    =================================
    RETURN PDF
    =================================
    */

    return new NextResponse(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=${invoice.invoice_number}.pdf`,
      },
    });
  } catch (err) {
    console.error("PDF generation error:", err);

    if (page) await page.close().catch(() => {});
    if (browser) await browser.disconnect().catch(() => {});

    return NextResponse.json({ error: "PDF failed" }, { status: 500 });
  }
}
