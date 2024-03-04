const orderCollection = require("../models/orderModel.js");
const formatDate = require("../service/formatDateHelper.js");
const getSalesData = require("../service/salesData.js");
const exceljs = require("exceljs");
const fs = require("fs");
// const PDFDocument = require('pdfkit');
const puppeteer = require("puppeteer");

// const { ObjectId } = require("mongodb");

const salesReport = async (req, res) => {
  try {
    if (req.session?.admin?.salesData) {
      let { salesData, dateValues } = req.session.admin;
      return res.render("admin/salesReport", { salesData, dateValues });
    }

    let page = Number(req.query.page) || 1;
    let limit = 10;
    let skip = (page - 1) * limit;

    let count = await orderCollection.countDocuments({ isListed: true });

    let salesData = await orderCollection
      .find({ orderStatus: "Delivered" })
      .populate("userId")
      .skip(skip)
      .limit(limit);

    console.log("lllllll", salesData);
    res.render("admin/salesReport", {
      salesData,
      dateValues: null,
      count,
      limit,
      page,
    });
  } catch (error) {
    console.error(error);
  }
};

const salesReportFilterCustom = async (req, res) => {
  try {
    let { startDate, endDate } = req.body;
    let salesDataFiltered = await orderCollection
      .find({
        orderDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
        orderStatus: "Delivered",
      })
      .populate("userId");

    salesData = salesDataFiltered.map((v) => {
      v.orderDateFormatted = formatDate(v.orderDate);
      return v;
    });

    req.session.admin = {};
    req.session.admin.dateValues = req.body;
    req.session.admin.salesData = JSON.parse(JSON.stringify(salesData));
    console.log(typeof req.session.admin.salesData);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
  }
};

const salesReportFilter = async (req, res) => {
  try {
    let { filterOption } = req.body;
    let startDate, endDate;

    if (filterOption === "month") {
      startDate = new Date();
      startDate.setDate(1);
      endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1, 0);
    } else if (filterOption === "week") {
      let currentDate = new Date();
      let currentDay = currentDate.getDay();
      let diff = currentDate.getDate() - currentDay - 7;
      startDate = new Date(currentDate.setDate(diff));
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
    } else if (filterOption === "year") {
      let currentYear = new Date().getFullYear();
      startDate = new Date(currentYear, 0, 1);
      endDate = new Date(currentYear, 11, 31);
    }

    let salesDataFiltered = await orderCollection
      .find({
        orderDate: { $gte: startDate, $lte: endDate },
        orderStatus: "Delivered",
      })
      .populate("userId");

    req.session.admin = {};
    req.session.admin.dateValues = { startDate, endDate };
    req.session.admin.salesData = JSON.parse(JSON.stringify(salesDataFiltered));

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

const salesReportDownload = async (req, res) => {
  try {
    const workBook = new exceljs.Workbook();
    const sheet = workBook.addWorksheet("book");
    sheet.columns = [
      { header: "Order No", key: "no", width: 10 },
      { header: "Order Date", key: "orderDate", width: 25 },
      { header: "Products", key: "products", width: 35 },
      { header: "No of items", key: "noOfItems", width: 35 },
      { header: "Total Cost", key: "totalCost", width: 25 },
      { header: "Payment Method", key: "paymentMethod", width: 25 },
      { header: "Status", key: "status", width: 20 },
    ];

    let salesData = req.session?.admin?.dateValues
      ? req.session.admin.salesData
      : await orderCollection.find().populate("userId");

    salesData = salesData.map((v) => {
      v.orderDateFormatted = formatDate(v.orderDate);
      return v;
    });

    salesData.forEach((v) => {
      sheet.addRow({
        no: v.orderNumber,
        username: v.userId.username,
        orderDate: v.orderDateFormatted,
        products: v.cartData.map((v) => v.productId.productName).join(", "),
        noOfItems: v.cartData.map((v) => v.productQuantity).join(", "),
        totalCost: "₹" + v.grandTotalCost,
        paymentMethod: v.paymentType,
        status: v.orderStatus,
      });
    });

    const totalOrders = salesData.length;
    const totalSales = salesData.reduce(
      (total, sale) => total + sale.grandTotalCost,
      0
    );
    const totalDiscount = salesData.reduce((total, sale) => {
      let discountAmount = sale.cartData.reduce((discount, cartItem) => {
        let productPrice = cartItem.productId.productPrice;
        let priceBeforeOffer = cartItem.productId.priceBeforeOffer;
        let discountPercentage = cartItem.productId.productOfferPercentage || 0;
        let actualAmount = productPrice * cartItem.productQuantity;
        let paidAmount =
          actualAmount - (actualAmount * discountPercentage) / 100;
        return discount + (actualAmount - paidAmount);
      }, 0);
      return total + discountAmount;
    }, 0);

    sheet.addRow({});
    sheet.addRow({ "Total Orders": totalOrders });
    sheet.addRow({ "Total Sales": "₹" + totalSales });
    sheet.addRow({ "Total Discount": "₹" + totalDiscount });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=salesReport.xlsx"
    );

    await workBook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.log(error);
    res.status(500).send("Error generating sales report");
  }
};

const salesReportDownloadPDF = async (req, res) => {
  try {
    const salesData = await getSalesData();

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    let htmlContent = `
      <h1 style="text-align: center;">Sales Report</h1>
      <table style="width:100%">
        <tr>
          <th>Order Number</th>
          <th>Order Date</th>
          <th>Products</th>
          <th>Quantity</th>
          <th>Total Cost</th>
          <th>Payment Method</th>
          <th>Status</th>
        </tr>`;

    salesData.forEach((order) => {
      htmlContent += `
        <tr>
          <td>${order.orderNumber}</td>
          <td>${order.orderDate}</td>
          <td>${order.products}</td>
          <td>${order.quantities}</td>
          <td>Rs.${order.totalCost}</td>
          <td>${order.paymentMethod}</td>
          <td>${order.orderStatus}</td>
        </tr>`;
    });

    htmlContent += `</table>`;

    await page.setContent(htmlContent);

    const pdfBuffer = await page.pdf({ format: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=salesReport.pdf"
    );

    res.send(pdfBuffer);

    await browser.close();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  salesReport,
  salesReportDownload,
  salesReportFilter,
  salesReportFilterCustom,
  salesReportDownloadPDF,
};
