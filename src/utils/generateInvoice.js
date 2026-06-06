import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const normalizeInvoiceItems = (order, cartItems) => {
    const itemSource = Array.isArray(cartItems) && cartItems.length > 0
        ? cartItems
        : Array.isArray(order?.orderItems)
            ? order.orderItems
            : [];

    return itemSource.map((item, idx) => {
        const quantity = Number(item?.quantity || 0);
        const unitPrice = Number(
            item?.orderedProductPrice
            ?? item?.specialPrice
            ?? item?.price
            ?? item?.product?.specialPrice
            ?? item?.product?.price
            ?? 0
        );

        return {
            id: idx + 1,
            productName: item?.productName || item?.product?.productName || `Product ${idx + 1}`,
            quantity,
            unitPrice,
            lineTotal: quantity * unitPrice,
        };
    });
};

/**
 * Generates and downloads a PDF invoice.
 *
 * @param {object} params
 * @param {object} params.order
 * @param {object} params.address
 * @param {Array} params.cartItems
 * @param {object} params.user
 * @param {string} params.sessionId
 */
export const generateInvoice = ({ order, address, cartItems, user, sessionId }) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const invoiceItems = normalizeInvoiceItems(order, cartItems);
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Smartcart", 14, 20);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text("smartcart.com", 14, 27);
    doc.setTextColor(0);

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", pageWidth - 14, 20, { align: "right" });

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    const orderId = order?.orderId ?? order?.id ?? sessionId ?? "N/A";
    doc.text(`Invoice #: ${orderId}`, pageWidth - 14, 27, { align: "right" });
    doc.text(`Date: ${dateStr}`, pageWidth - 14, 33, { align: "right" });
    doc.text("Payment: Stripe  |  Status: Paid", pageWidth - 14, 39, { align: "right" });
    doc.setTextColor(0);

    doc.setDrawColor(200);
    doc.line(14, 44, pageWidth - 14, 44);

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Bill To:", 14, 52);
    doc.text("Ship To:", pageWidth / 2, 52);

    doc.setFont("helvetica", "normal");

    const customerName = user?.username || user?.userName || user?.name || "Customer";
    const customerEmail = user?.email || order?.email || "";

    const billLines = [
        customerName,
        customerEmail,
        address?.buildingName || order?.address?.buildingName || "",
        address?.street || order?.address?.street || "",
        `${address?.city || order?.address?.city || ""}${address?.state || order?.address?.state ? `, ${address?.state || order?.address?.state}` : ""}`,
        `${address?.pincode || order?.address?.pincode || ""}${address?.country || order?.address?.country ? `  ${address?.country || order?.address?.country}` : ""}`,
    ].filter(Boolean);

    let billY = 57;
    billLines.forEach((line) => {
        doc.text(line, 14, billY);
        billY += 5;
    });

    doc.setFont("helvetica", "bold");
    doc.text("Payment Method:", pageWidth / 2, 46);
    doc.setFont("helvetica", "normal");
    doc.text(order?.payment?.pgName || order?.payment?.paymentMethod || "Stripe", pageWidth / 2, 51);
    doc.text(`Status: ${order?.payment?.pgStatus || "Paid"}`, pageWidth / 2, 56);

    const tableStartY = Math.max(billY, 72) + 4;
    const rows = invoiceItems.length > 0
        ? invoiceItems.map((item) => ([
            item.id,
            item.productName,
            `$${item.unitPrice.toFixed(2)}`,
            item.quantity,
            `$${item.lineTotal.toFixed(2)}`,
        ]))
        : [["-", "No product details available", "$0.00", 0, "$0.00"]];

    autoTable(doc, {
        startY: tableStartY,
        head: [["#", "Product", "Unit Price", "Qty", "Total"]],
        body: rows,
        headStyles: { fillColor: [30, 30, 30], textColor: 255, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        columnStyles: {
            0: { cellWidth: 10, halign: "center" },
            2: { halign: "right" },
            3: { halign: "center" },
            4: { halign: "right" },
        },
        margin: { left: 14, right: 14 },
    });

    const finalY = (doc.lastAutoTable?.finalY || tableStartY) + 6;
    const subtotal = invoiceItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const grandTotal = Number(order?.totalAmount ?? order?.totalPrice ?? subtotal).toFixed(2);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Subtotal:", pageWidth - 60, finalY);
    doc.text(`$${subtotal.toFixed(2)}`, pageWidth - 14, finalY, { align: "right" });

    doc.text("Tax (0%):", pageWidth - 60, finalY + 6);
    doc.text("$0.00", pageWidth - 14, finalY + 6, { align: "right" });

    doc.setFont("helvetica", "bold");
    doc.text("Total:", pageWidth - 60, finalY + 14);
    doc.text(`$${grandTotal}`, pageWidth - 14, finalY + 14, { align: "right" });

    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("Thank you for shopping with Smartcart!", pageWidth / 2, pageHeight - 10, {
        align: "center",
    });

    const fileName = `smartcart-invoice-${orderId}.pdf`;
    doc.save(fileName);
};
