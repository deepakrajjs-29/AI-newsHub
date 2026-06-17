import "dotenv/config";

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No GEMINI_API_KEY found in environment!");
    return;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions`;
  console.log(`Sending test request to ${url}...`);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gemini-2.5-flash",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Say hello!" },
      ],
      temperature: 0.3,
    }),
  });

  console.log(`Response Status: ${response.status} ${response.statusText}`);
  console.log(`Response Headers:`);
  response.headers.forEach((val, key) => {
    console.log(`  ${key}: ${val}`);
  });

  const text = await response.text();
  console.log(`Response Body:\n${text}`);
}

main().catch(console.error);
