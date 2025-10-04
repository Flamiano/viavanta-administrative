import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import supabase from "@/utils/Supabase";

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    // Check if user exists
    const { data: user, error } = await supabase
      .from("users")
      .select("id, first_name, email")
      .eq("email", email.trim().toLowerCase())
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: "No account found with that email." },
        { status: 404 }
      );
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP to database
    await supabase
      .from("users")
      .update({
        otp_code: otpCode,
        otp_attempts: 0, // reset attempts
      })
      .eq("id", user.id);

    // Send OTP Email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"ViaVanta Support" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Your Password Reset OTP Code",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>🔐 Password Reset Request</h2>
          <p>Hi ${user.first_name},</p>
          <p>Use the OTP code below to reset your password:</p>
          <h1 style="font-size: 28px; letter-spacing: 3px; color: #2563eb;">${otpCode}</h1>
          <hr/>
          <p>If you didn’t request this, please ignore this email.</p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "OTP sent to your email.",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json(
      { error: "Failed to send OTP email." },
      { status: 500 }
    );
  }
}
