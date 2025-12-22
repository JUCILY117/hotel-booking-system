import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";

export function generateInvoicePdf(res, payment) {
    const doc = new PDFDocument({ size: "A4", margin: 50 });

    const poppinsRegular = path.resolve("assets/fonts/Poppins-Regular.ttf");
    const poppinsBold = path.resolve("assets/fonts/Poppins-Bold.ttf");

    doc.registerFont("Poppins", poppinsRegular);
    doc.registerFont("Poppins-Bold", poppinsBold);


    const PAGE_WIDTH = doc.page.width;
    const MARGIN = 50;
    const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
        "Content-Disposition",
        `inline; filename=invoice-${payment.id}.pdf`
    );

    doc.pipe(res);

    const headerY = 50;

    const logoPath = path.resolve("assets/logo.png");
    if (fs.existsSync(logoPath)) {
        doc.image(logoPath, MARGIN, headerY, { width: 48 });
    }

    doc
        .font("Poppins-Bold")
        .fontSize(16)
        .text("Ezy Hotel", MARGIN + 60, headerY + 12);

    doc
        .font("Poppins-Bold")
        .fontSize(20)
        .text("INVOICE", MARGIN, headerY, {
            width: CONTENT_WIDTH,
            align: "right",
        });

    doc
        .font("Poppins")
        .fontSize(10)
        .text(`Invoice ID: ${payment.id}`, {
            width: CONTENT_WIDTH,
            align: "right",
        })
        .text(
            `Date: ${new Date(payment.createdAt).toLocaleDateString("en-IN")}`,
            {
                width: CONTENT_WIDTH,
                align: "right",
            }
        );

    doc.moveDown(3);

    doc.font("Poppins-Bold").fontSize(11).text("Billed To");
    doc
        .font("Poppins")
        .fontSize(10)
        .text(payment.booking.user?.name || "Customer")
        .text(payment.booking.user?.email || "");

    doc.moveDown(1.5);

    const checkIn = new Date(payment.booking.checkIn).toLocaleDateString("en-IN");
    const checkOut = new Date(payment.booking.checkOut).toLocaleDateString("en-IN");
    const nights =
        (new Date(payment.booking.checkOut) -
            new Date(payment.booking.checkIn)) /
        (1000 * 60 * 60 * 24);

    const amountINR = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
    }).format(payment.amount);


    doc.font("Poppins-Bold").fontSize(11).text("Booking Details");
    doc
        .font("Poppins")
        .fontSize(10)
        .text(`Hotel: ${payment.booking.room.hotel.name}`)
        .text(`Location: ${payment.booking.room.hotel.location}`)
        .text(`Room Type: ${payment.booking.room.type}`)
        .text(`Dates: ${checkIn} - ${checkOut} (${nights} nights)`)
        .text(`Booking ID: ${payment.booking.id}`);

    doc.moveDown(2);

    doc
        .moveTo(MARGIN, doc.y)
        .lineTo(PAGE_WIDTH - MARGIN, doc.y)
        .strokeColor("#E5E7EB")
        .stroke();

    doc.moveDown(1.5);

    doc.font("Poppins-Bold").fontSize(11).text("Payment Details");

    const iconMap = {
        VISA: "visa.png",
        MASTERCARD: "mastercard.png",
        AMEX: "amex.png",
        UPI: "upi.png",
        PAYPAL: "paypal.png",
    };

    const iconKey =
        payment.method === "CARD" && payment.cardBrand
            ? payment.cardBrand
            : payment.method;

    const iconPath = path.resolve("assets/icons", iconMap[iconKey] || "");

    const iconY = doc.y + 4;

    if (fs.existsSync(iconPath)) {
        doc.image(iconPath, MARGIN, iconY, { width: 24 });
    }

    doc
        .font("Poppins")
        .fontSize(10)
        .text(`Payment Method: ${payment.method}`, MARGIN + 34)
        .text(
            payment.cardBrand ? `Card Brand: ${payment.cardBrand}` : "",
            MARGIN + 34
        )
        .text(`Payment Status: ${payment.status}`, MARGIN + 34)
        .text(`Amount Paid: ${amountINR}`, MARGIN + 34);

    doc.moveDown(2);

    doc
        .font("Poppins-Bold")
        .fontSize(14)
        .text(`TOTAL PAID: ${amountINR}`, MARGIN, doc.y, {
            width: CONTENT_WIDTH,
            align: "right",
        });

    doc.moveDown(2);

    doc
        .fontSize(9)
        .fillColor("gray")
        .text(
            "This is a system generated invoice by Ezy Hotel. No signature required.",
            MARGIN,
            doc.y,
            {
                width: CONTENT_WIDTH,
                align: "center",
            }
        );

    doc.end();
}
