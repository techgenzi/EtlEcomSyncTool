const { until, By } = require('selenium-webdriver');
const { getDriver } = require('../webdriver');
const { default: axios } = require('axios');


exports.openPortal = async (req, res, next) => {
  try {
    const driver = await getDriver();
    // Navigate to the URL
    await driver.get(process.env.PORTAL_URL);

    // Wait for page and localStorage
    await driver.wait(until.elementLocated(By.css('body')), 10000);
    await driver.manage().window().maximize();
    res.send({}); // Send a response

  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error occurred');
  }
}

exports.getACcessToken = async (req, res, next) => {
  try {
    const driver = await getDriver();
    console.log(driver.status);
    const localStorageData = await driver.executeScript("return JSON.stringify(window.localStorage);");
    console.log(localStorageData);
    const tokenList = JSON.parse(localStorageData);
    var token = "";
    for (const key in tokenList) {
      if (key.includes('accessToken')) {
        token = tokenList[key];
      }
    }
    res.cookie('accessToken', token, {
      maxAge: 3600000, // 1 hour in milliseconds
      httpOnly: true,
      sameSite: 'none',
      secure: true
    });
    return res.send(token)
  } catch (err) {
    console.log(err);
    return res.send({
      error: err
    });
  }
}

function getFormattedDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}


exports.syncData = async (req, res, next) => {
  let accessToken = req.cookies.accessToken;
  console.log(accessToken)
  console.log(req.headers.authorization)
  console.log("Called sync data")

  let ipss_token = req.headers.authorization;
  let headers = {
    "Origin": "https://vendor.onequince.com",
    'User-Agent': process.env.USER_AGENT,
    'Authorization': `Bearer ${accessToken}`
  }
  // For Purchase Orders
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 6);

  const formattedEndDate = getFormattedDate(endDate);
  const formattedStartDate = getFormattedDate(startDate);

  let result = await axios.get(
    `${process.env.PURCHASE_ORDERS_API}&startDate=${formattedStartDate}&endDate=${formattedEndDate}`,
    {
      headers: headers
    }
  )
  const chunkSize = 5;
  const chunks = [];

  // Split the array into chunks of 1000 records
  for (let i = 0; i < result.data.length; i += chunkSize) {
    chunks.push(result.data.slice(i, i + chunkSize));
  }

  // Loop through the chunks and make API post requests
  for (const chunk of chunks) {
    try {
      console.log("Processing ", chunk.length, " records")

      const finalResult = await axios.post(process.env.PROCESS_ETL_API, chunk, {
        headers: {
          'Authorization': ipss_token,
          'X-Content-Type': 'purchaseOrders'
        },
        timeout: 3000000
      });
      console.log("Processed ", chunk.length, " records")
      // Handle the response as needed
      // console.log(finalResult.data);

    } catch (error) {
      // Handle the error as needed
      console.error(error);
    }
  }
  // For Customer Orders
  let result2 = await axios.get(
    process.env.CUSTOMER_ORDERS_API,
    {
      headers: headers
    }
  )
  let finalResult2 = await axios.post(
    process.env.PROCESS_ETL_API,
    result2.data,
    {
      headers: {
        'Authorization': ipss_token,
        'X-Content-Type': 'customerOrders'
      },
      timeout: 3000000
    }
  )
  //console.log(finalResult2)
  return res.send({
    success: true
  });
}

exports.pingApi = async (req, res, next) => {
  return res.send({
    success: true
  });
}

exports.lastSynced = async (req, res, next) => {
  return res.send({
    success: true,
    lastSynced: "2024-03-01T00:00:00.000Z"
  });
}

exports.systemCheck = async (req, res, next) => {
  return res.send({
    success: true,
    chromeVersion: "122.0.6261.94",
    chromedriverVersion: "122.0.6261.94",
    apiStatus: "up"
  });
}

exports.testUrl = async (req, res, next) => {
  return res.send([
    {
      "id": 5679602958506,
      "name": "#4114768",
      "orderNumber": 4114768,
      "email": "imageisfound@mac.com",
      "test": false,
      "subtotalPrice": "579.60",
      "currentTotalPrice": "579.60",
      "totalPrice": "579.60",
      "lineItems": [
        {
          "id": 13801770188970,
          "productId": 4564216414319,
          "variantId": 39828855718058,
          "title": "Organic Luxe Waffle Duvet Cover",
          "quantity": 1,
          "price": "109.90",
          "grams": 2031.0,
          "sku": "LB22410",
          "vendor": "VTM001",
          "productHandle": null,
          "variantTitle": "King/Cal King / Light Grey",
          "fulfillmentStatus": "open",
          "draftStatus": null,
          "originLocation": null,
          "variant": null,
          "fulfillmentId": null,
          "taxLines": [
            {
              "price": "0.00",
              "rate": 0.0,
              "title": "OR STATE TAX"
            }
          ],
          "discountAllocations": [],
          "fulfillmentLocationId": null,
          "orderId": null,
          "shipmentId": null,
          "shipmentStatus": null,
          "fulfillableQuantity": 0,
          "image": null,
          "returnRaised": false,
          "returnedQuantity": 0,
          "tags": null,
          "properties": [
            {
              "name": "createdAt",
              "value": "1703721736100"
            }
          ],
          "totalDiscount": "0.00",
          "size": null,
          "color": null,
          "vendorItemConfigId": null,
          "vendorItemModelId": null,
          "assignedInventories": [],
          "requiresShipping": true,
          "labelUrl": null,
          "invoiceUrl": null,
          "bundleProduct": false,
          "propertiesMap": {
            "createdAt": "1703721736100"
          },
          "orderIdString": null,
          "lineItemIdString": null,
          "isLineItemReturnable": true,
          "omsLineItemId": null
        }
      ],
      "totalWeight": 10724,
      "financialStatus": "paid",
      "confirmed": true,
      "orderStatusUrl": "https://checkout.quince.com/5644320879/orders/b62ee6b850cbd373fe6cb80687d7c82d/authenticate?key=d8af3dea8c78f77e8857c3ddc2fffd41",
      "customer": {
        "id": 7617417707690,
        "firstName": "nate",
        "lastName": "kaiser",
        "email": "imageisfound@mac.com"
      },
      "shippingAddress": {
        "address1": "63314 CHAPARREL DR",
        "address2": "",
        "city": "BEND",
        "company": null,
        "country": "United States",
        "first_name": "nate",
        "last_name": "kaiser",
        "phone": "",
        "province": "Oregon",
        "zip": "97701",
        "name": "nate kaiser",
        "country_code": "US",
        "province_code": "OR",
        "latitude": 44.0988149,
        "longitude": -121.170107,
        "location_id": null,
        "complete_address": "nate kaiser, 63314 CHAPARREL DR, BEND, Oregon, United States, 97701"
      },
      "billingAddress": {
        "address1": "63314 CHAPARREL DR",
        "address2": "",
        "city": "BEND",
        "company": null,
        "country": "United States",
        "first_name": "nate",
        "last_name": "kaiser",
        "phone": "",
        "province": "Oregon",
        "zip": "97701",
        "name": "nate kaiser",
        "country_code": "US",
        "province_code": "OR",
        "latitude": 44.0988149,
        "longitude": -121.170107,
        "complete_address": "nate kaiser, 63314 CHAPARREL DR, BEND, Oregon, United States, 97701"
      },
      "fulfillments": [
        {
          "id": 5198095351978,
          "lineItems": [
            {
              "id": 13801770188970,
              "productId": 4564216414319,
              "variantId": 39828855718058,
              "title": "Organic Luxe Waffle Duvet Cover",
              "quantity": 1,
              "price": "109.90",
              "grams": 2031.0,
              "sku": "LB22410",
              "vendor": "VTM001",
              "productHandle": null,
              "variantTitle": "King/Cal King / Light Grey",
              "fulfillmentStatus": "fulfilled",
              "draftStatus": null,
              "originLocation": null,
              "variant": null,
              "fulfillmentId": null,
              "taxLines": [
                {
                  "price": "0.00",
                  "rate": 0.0,
                  "title": "OR STATE TAX"
                }
              ],
              "discountAllocations": [],
              "fulfillmentLocationId": null,
              "orderId": null,
              "shipmentId": null,
              "shipmentStatus": null,
              "fulfillableQuantity": 0,
              "image": null,
              "returnRaised": false,
              "returnedQuantity": 0,
              "tags": null,
              "properties": [
                {
                  "name": "createdAt",
                  "value": "1703721736100"
                }
              ],
              "totalDiscount": "0.00",
              "size": null,
              "color": null,
              "vendorItemConfigId": null,
              "vendorItemModelId": null,
              "assignedInventories": [
                {
                  "inventoryItemId": 4000,
                  "inventoryLotId": 10885,
                  "quantity": 1,
                  "vendorCode": "VTM001",
                  "vendorName": null,
                  "inventoryUnitIds": [
                    "N4B601351D474"
                  ]
                }
              ],
              "requiresShipping": true,
              "labelUrl": null,
              "invoiceUrl": null,
              "bundleProduct": false,
              "propertiesMap": {
                "createdAt": "1703721736100"
              },
              "orderIdString": null,
              "lineItemIdString": null,
              "isLineItemReturnable": true,
              "omsLineItemId": null
            }
          ],
          "locationId": 9387147375,
          "orderId": 5679602958506,
          "shipmentStatus": null,
          "status": "open",
          "notifyCustomer": null,
          "trackingCompany": "DHL India",
          "trackingNumbers": [
            "4018334935"
          ],
          "trackingUrls": [
            "https://www.quince.com/tracking?orderId=5679602958506&trackId=4018334935"
          ],
          "fulfillmentLocationId": 97,
          "name": "#4114768.2",
          "createdAt": "2023-12-28T19:01:27-08:00",
          "updatedAt": "2023-12-28T19:01:28-08:00",
          "fulfilledAt": null,
          "confirmedAt": null,
          "labelUrl": "http://labels.lastbrand.com/DHL_INDIA/4018334935.pdf",
          "vendorFulfilledAtUtc": null,
          "invoiceUrl": null
        }
      ],
      "fulfillmentStatus": "partial",
      "discountCodes": [],
      "discountApplications": [],
      "shippingLines": [
        {
          "code": "LB_STANDARD",
          "title": "Standard",
          "price": "0.00"
        }
      ],
      "createdAt": "2023-12-27T16:07:55-08:00",
      "createdAtUtc": null,
      "taxLines": [],
      "totalTax": "0.00",
      "totalDiscounts": "0.00",
      "totalLineItemsPrice": "579.60",
      "processingMethod": "direct",
      "paymentDetails": {
        "credit_card_bin": "379568",
        "credit_card_number": "•••• •••• •••• 2008",
        "credit_card_company": "American Express"
      },
      "tags": "",
      "draftFulfillments": [],
      "cancelledAt": null,
      "cancelReason": null,
      "refunds": [],
      "cardDetailsPresent": null,
      "checkoutToken": "c547baed4159a5a0c26bc658bef3de7b",
      "addressCheckFailed": null,
      "orderReferenceNumber": null,
      "omsOrderId": null,
      "unallocatedLineItems": [],
      "shippingServiceLevel": "LB_STANDARD"
    }
  ]);
}