import nodemailer from "nodemailer";

export async function POST(req) {
  const { email, firstName, reason } = await req.json();

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
      subject: "Your account has been deleted",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Hello ${firstName},</h2>
          <p>Your account has been <strong>deleted</strong> by the administrator.</p>
          <p><strong>Reason:</strong> ${reason}</p>
          <br/>
          <p>If you believe this was a mistake, please contact support.</p>
          <br/>
          <p>Best regards,<br/>The ViaVanta Team</p>
        </div>
      `,
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("Deletion email error:", err);
    return new Response(JSON.stringify({ error: "Email failed to send" }), {
      status: 500,
    });
  }
}
