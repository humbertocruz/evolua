import { NextResponse } from "next/server";

export async function GET() {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Evolua Project</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/app/page.tsx"></script>
</body>
</html>
  `.trim();

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html" },
  });
}
