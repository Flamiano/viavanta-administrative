import nodemailer from "nodemailer";

export async function POST(req) {
  const { email, firstName, documentTitle } = await req.json();

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
      subject: "Your account has been restored",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Hello ${firstName},</h2>
          <p>Good news! Your document <strong>"${documentTitle}"</strong> has been <strong>retrieved</strong> by the admin.</p>
          <p>Your account is now active again and you can <strong>log in immediately</strong>.</p>
          <br/>
          <p>Best regards,<br/>The ViaVanta Team</p>
        </div>
      `,
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("Retrieval email error:", err);
    return new Response(JSON.stringify({ error: "Email failed to send" }), {
      status: 500,
    });
  }
}
