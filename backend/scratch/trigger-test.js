async function run() {
  try {
    const res = await fetch('http://127.0.0.1:5000/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'yandrapallijaswanth@gmail.com' })
    });
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Data:', data);
  } catch (err) {
    console.error('Error:', err);
  }
}
run();
