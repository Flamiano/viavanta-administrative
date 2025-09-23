import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    // Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // your Gmail (needs app password if 2FA enabled)
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send inquiry to admin inbox
    await transporter.sendMail({
      from: `"ViaVanta Contact Form" <${process.env.EMAIL_USER}>`,
      to: "viavanta.web@gmail.com", // 🔹 your admin inbox
      subject: `New Inquiry from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>📩 New Contact Inquiry</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong><br/>${message}</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact email error:", err);
    return NextResponse.json(
      { error: "Email failed to send" },
      { status: 500 }
    );
  }
}
