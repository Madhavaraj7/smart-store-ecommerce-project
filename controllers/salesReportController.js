const orderCollection = require("../models/orderModel.js");
const formatDate = require("../service/formatDateHelper.js");

const exceljs = require("exceljs");

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
      .find({ orderStatus: "Delivered" }) // Filter only delivered orders
      .populate("userId")
      .skip(skip)
      .limit(limit);

    console.log(salesData);
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
        let diff = currentDate.getDate() - currentDay + (currentDay === 0 ? -6 : 1); 
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
        { header: "No", key: "no", width: 10 },
        { header: "Order Date", key: "orderDate", width: 25 },
        { header: "Products", key: "products", width: 35 },
        { header: "No of items", key: "noOfItems", width: 35 },
        { header: "Total Cost", key: "totalCost", width: 25 },
        { header: "Payment Method", key: "paymentMethod", width: 25 },
        { header: "Status", key: "status", width: 20 },
      ];
  
      let salesData = req.session?.admin?.dateValues
        ? await orderCollection
            .find({
              orderDate: {
                $gte: new Date(req.session.admin.dateValues.startDate),
                $lte: new Date(req.session.admin.dateValues.endDate),
              },
            })
            .populate("userId")
        : await orderCollection.find().populate("userId");
  
      salesData = salesData.map((v) => {
        v.orderDateFormatted = formatDate(v.orderDate);
        return v;
      });
  
      salesData.map((v) => {
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
  
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=salesReport.xlsx"
      );
  
      workBook.xlsx.write(res);
    } catch (error) {
      console.log(error);
    }
  };
  
  module.exports = { salesReport, salesReportDownload, salesReportFilter };

