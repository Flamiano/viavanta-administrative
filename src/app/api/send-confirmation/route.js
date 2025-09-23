import nodemailer from "nodemailer";

export async function POST(req) {
  const { email, firstName } = await req.json();

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"ViaVanta Administrative Website" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Thank you for registering!",
      text: `Hello ${firstName},

Thank you for registering with ViaVanta Administrative Website.

Please wait for Admin Approval before logging in (1–2 business days).

Once approved, you will receive another email notification.

Best regards,
The ViaVanta Team`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Hello ${firstName},</h2>
          <p>Thank you for registering with <strong>ViaVanta Administrative Website</strong>.</p>
          <p><b>Please wait for Admin Approval before logging in</b>. This process usually takes <strong>1–2 business days</strong>.</p>
          <p>Once approved, you will receive another email notification.</p>
          <br/>
          <p>Best regards,<br/>The ViaVanta Team</p>
        </div>
      `,
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("Email error:", err.message, err.stack);
    return new Response(
      JSON.stringify({ error: "Email failed to send", details: err.message }),
      { status: 500 }
    );
  }
}
