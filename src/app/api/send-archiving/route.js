import nodemailer from "nodemailer";

export async function POST(req) {
  const { email, firstName, documentTitle, blockedUntil } = await req.json();

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"ViaVanta Administrative Website" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your document has been archived",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Hello ${firstName},</h2>
          <p>This is to inform you that your document <strong>"${documentTitle}"</strong> has been <strong>archived</strong> by the admin.</p>
          <p>As a result, your account will be temporarily blocked until <strong>${blockedUntil}</strong>.</p>
          <p>The document will automatically be deleted from our database after 2 weeks.</p>
          <br/>
          <p>Best regards,<br/>The ViaVanta Team</p>
        </div>
      `,
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("Archiving email error:", err);
    return new Response(JSON.stringify({ error: "Email failed to send" }), {
      status: 500,
    });
  }
}
