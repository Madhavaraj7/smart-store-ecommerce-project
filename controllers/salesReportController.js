const orderCollection = require("../models/orderModel.js");
const formatDate = require("../service/formatDateHelper.js");

const exceljs = require("exceljs");
const fs = require('fs');
const PDFDocument = require('pdfkit');

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

      

    console.log("lllllll",salesData);
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

const salesReportFilterCustom= async (req, res) => {
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


  // sales report filter

  const salesReportFilter = async (req, res) => {
    try {
        let { filterOption } = req.body;
        let startDate, endDate;

        if (filterOption === 'month') {
            startDate = new Date();
            startDate.setDate(1);
            endDate = new Date();
            endDate.setMonth(endDate.getMonth() + 1, 0);
        } else if (filterOption === 'week') {
            let currentDate = new Date();
            let currentDay = currentDate.getDay();
            let diff = currentDate.getDate() - currentDay - 7; 
            startDate = new Date(currentDate.setDate(diff));
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);
        } else if (filterOption === 'year') {
            let currentYear = new Date().getFullYear();
            startDate = new Date(currentYear, 0, 1);
            endDate = new Date(currentYear, 11, 31);
        }

        let salesDataFiltered = await orderCollection.find({
            orderDate: { $gte: startDate, $lte: endDate },
            orderStatus: "Delivered" // Only include delivered orders

        }).populate("userId");

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
      ? req.session.admin.salesData // Use filtered sales data from session
      : await orderCollection.find().populate("userId"); // Use all sales data

    salesData = salesData.map((v) => {
      v.orderDateFormatted = formatDate(v.orderDate);
      return v;
    });

    salesData.forEach((v) => { // Use forEach instead of map since we're not returning a new array
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

    // Calculate total orders, total sales, and total discount
    const totalOrders = salesData.length;
    const totalSales = salesData.reduce((total, sale) => total + sale.grandTotalCost, 0);
    const totalDiscount = salesData.reduce((total, sale) => {
      let discountAmount = sale.cartData.reduce((discount, cartItem) => {
        let productPrice = cartItem.productId.productPrice;
        let priceBeforeOffer = cartItem.productId.priceBeforeOffer;
        let discountPercentage = cartItem.productId.productOfferPercentage || 0; // If no discount, default to 0
        let actualAmount = productPrice * cartItem.productQuantity;
        let paidAmount = actualAmount - (actualAmount * discountPercentage / 100); // Calculate paid amount after discount
        return discount + (actualAmount - paidAmount); // Add discounted amount to total discount
      }, 0);
      return total + discountAmount;
    }, 0);

    // Add summary column headers and data to the sheet
    sheet.addRow({}); // Add empty row for spacing
    sheet.addRow({ "Total Orders": totalOrders });
    sheet.addRow({ "Total Sales": "₹" + totalSales });
    sheet.addRow({ "Total Discount": "₹" + totalDiscount });

    // Write workbook to response
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
    const doc = new PDFDocument();

    doc.fontSize(12);
    doc.text('Sales Report', { align: 'center' });
    doc.moveDown();
    doc.text('No\tOrder Date\tProducts\tNo of items\tTotal Cost\tPayment Method\tStatus');

    let salesData = req.session?.admin?.dateValues
      ? await orderCollection
        .find({
          orderDate: {
            $gte: new Date(req.session.admin.dateValues.startDate),
            $lte: new Date(req.session.admin.dateValues.endDate),
          },
        })
        .populate('userId')
      : await orderCollection.find().populate('userId');

    salesData = salesData.map((v) => {
      v.orderDateFormatted = formatDate(v.orderDate);
      return v;
    });

    salesData.forEach((v) => {
      doc.moveDown();
      doc.text(`${v.orderNumber}\t${v.orderDateFormatted}\t${v.cartData.map((v) => v.productId.productName).join(', ')}\t${v.cartData.map((v) => v.productQuantity).join(', ')}\t₹${v.grandTotalCost}\t${v.paymentType}\t${v.orderStatus}`);
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=salesReport.pdf');

    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).send('Internal Server Error');
  }
};


  
  module.exports = { salesReport, salesReportDownload, salesReportFilter ,salesReportFilterCustom,salesReportDownloadPDF};