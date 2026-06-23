import { NextResponse } from 'next/server';

function generateCVHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <title>Atanas Kyurkchiev - CV</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; line-height: 1.6; }
    .container { max-width: 800px; margin: 0 auto; padding: 2rem; }
    .space-y-12 > * + * { margin-top: 3rem; }
    .space-y-6 > * + * { margin-top: 1.5rem; }
    .space-y-4 > * + * { margin-top: 1rem; }
    .space-y-2 > * + * { margin-top: 0.5rem; }
    .text-4xl { font-size: 2.25rem; font-weight: 300; }
    .text-2xl { font-size: 1.5rem; font-weight: 500; }
    .text-xl { font-size: 1.25rem; }
    .text-lg { font-size: 1.125rem; font-weight: 500; }
    .text-sm { font-size: 0.875rem; }
    .text-xs { font-size: 0.75rem; }
    .border-b { border-bottom: 2px solid #047857; padding-bottom: 0.5rem; }
    .skill-tag { display: inline-block; padding: 0.25rem 0.5rem; margin: 0.125rem; border: 1px solid #e5e5e5; background: #f5f5f5; font-size: 0.75rem; }
    .flex { display: flex; }
    .flex-wrap { flex-wrap: wrap; }
    .justify-between { justify-content: space-between; }
    .justify-center { justify-content: center; }
    .items-start { align-items: flex-start; }
    .space-x-6 > * + * { margin-left: 1.5rem; }
    .gap-2 > * { margin: 0.125rem; }
    .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1.5rem; }
    .text-center { text-align: center; }
    .leading-relaxed { line-height: 1.625; }
    .mb-3 { margin-bottom: 0.75rem; }
    
    body { background: #ffffff; color: #000000; }
    .text-neutral-600 { color: #525252; }
    .text-neutral-700 { color: #374151; }
    .skill-tag { background: #ecfdf5; border-color: #047857; color: #065f46; }
    
    @media print {
      body { font-size: 12pt; }
      .container { padding: 1rem; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="space-y-12">
      <!-- Header -->
      <header class="text-center space-y-4">
        <h1 class="text-4xl">atanas kyurkchiev</h1>
        <p class="text-xl text-neutral-600">web developer & digital solutions specialist</p>
        <div class="flex justify-center space-x-6 text-sm">
          <span>me@atanaskyurkchiev.info</span>
          <span>github.com/nnasko</span>
          <span>linkedin.com/in/atanas-kyurkchiev</span>
        </div>
      </header>

      <!-- About -->
      <section class="space-y-4">
        <h2 class="text-2xl border-b">professional summary</h2>
        <p class="leading-relaxed text-neutral-700">
          i'm a web developer and computer science student, and i've been building full-stack web apps for a few years now. i run my own agency, kyurkchiev group, co-founded a proptech startup called propvantage, and work as a junior front end dev at lancaster uni. i care about clean code and interfaces that actually work for people, and i'd rather ship something than overthink it. mostly react, next.js and typescript.
        </p>
      </section>

      <!-- Experience -->
      <section class="space-y-6">
        <h2 class="text-2xl border-b">experience</h2>
        
        <div class="space-y-2">
          <div class="flex justify-between items-start">
            <h3 class="text-lg">co-founder & director</h3>
            <span class="text-sm text-neutral-600">2025 - present</span>
          </div>
          <p class="text-neutral-700" style="font-weight: 500;">propvantage limited</p>
          <p class="text-sm leading-relaxed">co-founded propvantage, a proptech startup. we build propscribe, which turns iphone dictation on site into rics-compliant survey reports with ai and saves surveyors hours of writing up. i work on product direction with my co-founder (a practising chartered surveyor) and built the whole thing: ios app, web dashboard, backend and the ai rewrite pipeline. in private beta right now.</p>
        </div>

        <div class="space-y-2">
          <div class="flex justify-between items-start">
            <h3 class="text-lg">founder & web developer</h3>
            <span class="text-sm text-neutral-600">2024 - present</span>
          </div>
          <p class="text-neutral-700" style="font-weight: 500;">kyurkchiev group</p>
          <p class="text-sm leading-relaxed">my own web agency in norwich, building sites and web apps for businesses. i do the lot, the design, the build and dealing with clients. built the whole back office myself (stripe invoicing, contract e-signing and a blog cms), and the marketing sites lean heavy on motion with next.js, gsap and three.js.</p>
        </div>

        <div class="space-y-2">
          <div class="flex justify-between items-start">
            <h3 class="text-lg">junior front end developer</h3>
            <span class="text-sm text-neutral-600">2025 - present</span>
          </div>
          <p class="text-neutral-700" style="font-weight: 500;">lancaster university</p>
          <p class="text-sm leading-relaxed">building and looking after the university's web apps and internal tools. mostly front end work, keeping things responsive and accessible, in a proper team with designers and backend devs. writing tests and docs and keeping the code tidy.</p>
        </div>

        <div class="space-y-2">
          <div class="flex justify-between items-start">
            <h3 class="text-lg">senior lead developer</h3>
            <span class="text-sm text-neutral-600">2024 - present</span>
          </div>
          <p class="text-neutral-700" style="font-weight: 500;">surplush</p>
          <p class="text-sm leading-relaxed">lead dev on a sustainable business supplies platform. built the inventory and order management side of it, wired up stripe, klaviyo and zedify, and spent a lot of time on speed and making it nice to use.</p>
        </div>

        <div class="space-y-2">
          <div class="flex justify-between items-start">
            <h3 class="text-lg">wordpress developer</h3>
            <span class="text-sm text-neutral-600">2025</span>
          </div>
          <p class="text-neutral-700" style="font-weight: 500;">engage media</p>
          <p class="text-sm leading-relaxed">built custom wordpress components, fixed up bugs in the existing ones, tidied up the ui and styling, and made the day to day dev workflow a bit smoother.</p>
        </div>
      </section>

      <!-- Education -->
      <section class="space-y-6">
        <h2 class="text-2xl border-b">education</h2>
        
        <div class="space-y-2">
          <div class="flex justify-between items-start">
            <h3 class="text-lg">computer science</h3>
            <span class="text-sm text-neutral-600">2025 - present</span>
          </div>
          <p class="text-neutral-700" style="font-weight: 500;">lancaster university</p>
          <p class="text-sm leading-relaxed">studying computer science while running my own work on the side, and putting what i learn straight into real client projects.</p>
        </div>
        
        <div class="space-y-2">
          <div class="flex justify-between items-start">
            <h3 class="text-lg">software development</h3>
            <span class="text-sm text-neutral-600">2023 - 2025 · distinction (aaa)</span>
          </div>
          <p class="text-neutral-700" style="font-weight: 500;">access creative college</p>
          <p class="text-sm leading-relaxed">graduated with a distinction (aaa). covered full-stack development, databases, agile and software engineering.</p>
        </div>
      </section>

      <!-- Skills -->
      <section class="space-y-6">
        <h2 class="text-2xl border-b">skills</h2>
        <div class="grid-3">
          <div>
            <h3 class="text-lg mb-3">technical</h3>
            <div class="flex flex-wrap gap-2">
              <span class="skill-tag">javascript / typescript</span>
              <span class="skill-tag">react</span>
              <span class="skill-tag">next.js</span>
              <span class="skill-tag">node.js</span>
              <span class="skill-tag">python</span>
              <span class="skill-tag">postgresql</span>
              <span class="skill-tag">prisma</span>
              <span class="skill-tag">git</span>
              <span class="skill-tag">tailwind css</span>
              <span class="skill-tag">gsap</span>
              <span class="skill-tag">framer motion</span>
              <span class="skill-tag">stripe</span>
            </div>
          </div>
          <div>
            <h3 class="text-lg mb-3">design</h3>
            <div class="flex flex-wrap gap-2">
              <span class="skill-tag">ui/ux</span>
              <span class="skill-tag">responsive design</span>
              <span class="skill-tag">figma</span>
            </div>
          </div>
          <div>
            <h3 class="text-lg mb-3">other</h3>
            <div class="flex flex-wrap gap-2">
              <span class="skill-tag">problem solving</span>
              <span class="skill-tag">communication</span>
              <span class="skill-tag">agile</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</body>
</html>`;
}

export async function GET() {
  const html = generateCVHTML();

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
} 