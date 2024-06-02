import nodemailer from 'nodemailer';

export const DeliveryEmailReceipt = async (order) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS
      }
    });

    const info = await transporter.sendMail({
      from: process.env.EMAIL,
      to: order.user.email,
      subject: `Order ${order.id} has been delivered`,
      html: getReceiptHtml(order)
    });

    console.log("Email sent: " + info.messageId);
  } catch (err) {
    console.log(err.message);
  }
};

const getReceiptHtml = (order) => {
  return `
    <html>
      <head>
        <style>
        table {
          border-collapse: collapse;
          max-width: 35rem;
          width: 100%;
        }
        th, td {
          text-align: left;
          padding: 8px;
        }
        th {
          border-bottom: 1px solid #dddddd;
        }
        </style>
      </head>
      <body>
        <h1>Order Delivery Confirmation</h1>
        <p>Dear ${order.name},</p>
        <p>Thank you for choosing us! Your order has been successfully delivered.</p>
        <p><strong>Tracking ID:</strong> ${order.id}</p>
        <p><strong>Order Date:</strong> ${order.createdAt
          .toISOString()
          .replace('T', ' ')
          .substr(0, 16)}</p>
        <h2>Order Details</h2>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Unit Price</th>
              <th>Quantity</th>
              <th>Total Price</th>
            </tr>
          </thead>
          <tbody>
          ${order.items
            .map(
              item =>
                `
              <tr>
              <td>${item.food.name}</td>
              <td>Rs.${item.food.price}</td>
              <td>${item.quantity}</td>    
              <td>Rs.${item.price.toFixed(2)}</td>
              </tr>
              `
            )
            .join('\n')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3"><strong>Total:</strong></td>
              <td>Rs.${order.totalPrice}</td>
            </tr>
          </tfoot>
        </table>
        <p><strong>Shipping Address:</strong> ${order.address}</p>
      </body>
    </html>
  `;
};
