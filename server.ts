import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import nodemailer from "nodemailer";
import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Order Notifications
  app.post("/api/orders/notify", async (req, res) => {
    const { order } = req.body;

    if (!order || !order.id || !order.customerInfo) {
      console.error('Invalid order data received for notification:', order);
      return res.status(400).json({ success: false, error: 'Invalid order data' });
    }

    try {
      // 1. Send Email Notifications (requires EMAIL_USER and EMAIL_PASS)
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        try {
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
          });

          // Verify transporter connection
          await transporter.verify();

          const isAdminEmail = true; // For now, always notify admin
          const isCustomerConfirmation = order.status === 'confirmed';

          if (isAdminEmail) {
            await transporter.sendMail({
              from: `"PureNature Orders" <${process.env.EMAIL_USER}>`,
              to: 'hminhajulonline@gmail.com',
              subject: `New Order Received: #${order.id?.slice(-6).toUpperCase()}`,
              html: `
                <h1>New Order Details</h1>
                <p><strong>Customer:</strong> ${order.customerInfo?.name || 'N/A'}</p>
                <p><strong>Phone:</strong> ${order.customerInfo?.phone || 'N/A'}</p>
                <p><strong>Address:</strong> ${order.customerInfo?.address || 'N/A'}, ${order.customerInfo?.city || 'N/A'}</p>
                <p><strong>Total:</strong> ৳${order.total}</p>
                <h3>Items:</h3>
                <ul>
                  ${(order.items || []).map((item: any) => `<li>${item.name} x ${item.quantity} - ৳${item.price * item.quantity}</li>`).join('')}
                </ul>
              `,
            });
            console.log('Admin notification email sent');
          }

          if (isCustomerConfirmation && order.customerInfo?.email) {
            await transporter.sendMail({
              from: `"PureNature" <${process.env.EMAIL_USER}>`,
              to: order.customerInfo.email,
              subject: `Order Confirmed: #${order.id?.slice(-6).toUpperCase()}`,
              html: `
                <h1>Your order has been confirmed!</h1>
                <p>Hi ${order.customerInfo.name},</p>
                <p>We've confirmed your order and it's being prepared for delivery.</p>
                <p><strong>Order ID:</strong> ${order.id}</p>
                <p><strong>Total:</strong> ৳${order.total}</p>
                <p>You can track your order status on our website using your Order ID.</p>
              `,
            });
            console.log('Customer confirmation email sent');
          }
        } catch (emailErr: any) {
          console.error('Email notification error:', emailErr);
          if (emailErr.message?.includes('Application-specific password required')) {
            console.error('CRITICAL: Gmail requires an "App Password" to send emails. Please generate one at https://myaccount.google.com/apppasswords and use it as EMAIL_PASS.');
          }
        }
      } else {
        console.log('Skipping email notifications: EMAIL_USER or EMAIL_PASS not set');
      }

      // 2. Add to Google Sheets (Conceptual - requires service account credentials)
      if (process.env.GOOGLE_SHEETS_ID && process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
        try {
          const auth = new google.auth.GoogleAuth({
            credentials: {
              client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
              private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
          });

          const sheets = google.sheets({ version: 'v4', auth });
          await sheets.spreadsheets.values.append({
            spreadsheetId: process.env.GOOGLE_SHEETS_ID,
            range: 'Sheet1!A:Z',
            valueInputOption: 'RAW',
            requestBody: {
              values: [[
                order.id,
                order.createdAt,
                order.customerInfo?.name || 'N/A',
                order.customerInfo?.email || 'N/A',
                order.customerInfo?.phone || 'N/A',
                order.customerInfo?.address || 'N/A',
                order.total,
                order.status
              ]],
            },
          });
          console.log('Google Sheet updated');
        } catch (sheetErr) {
          console.error('Google Sheet update error:', sheetErr);
        }
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Notification error:', error);
      res.json({ success: false, error: 'Notification failed but order was placed.' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
