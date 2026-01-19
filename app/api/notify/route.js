import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { email, name } = await request.json();
    
    // Send notification email to you
    await resend.emails.send({
      from: 'ForgeCrew <onboarding@resend.dev>',
      to: 'ltlacosse@gmail.com', // Your email
      subject: '🔥 New ForgeCrew Signup!',
      html: `
        <h2>New user signed up for ForgeCrew!</h2>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Name:</strong> ${name || 'Not provided yet'}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <br>
        <p>Log into your <a href="https://supabase.com/dashboard">Supabase dashboard</a> to see all users.</p>
      `
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Email error:', error);
    return Response.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}
