import { NextRequest, NextResponse } from 'next/server';

function generateCVHTML(theme: string = 'light') {
  const isDark = theme === 'dark';
  
  return `<!DOCTYPE html>
<html class="${isDark ? 'dark' : ''}">
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
    .border-b { border-bottom: 1px solid #e5e5e5; padding-bottom: 0.5rem; }
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
    
    /* Dark theme */
    .dark { background: #1a1a1a; color: #e5e5e5; }
    .dark .border-b { border-color: #404040; }
    .dark .skill-tag { background: #2a2a2a; border-color: #404040; color: #e5e5e5; }
    .dark .text-neutral-600 { color: #a3a3a3; }
    .dark .text-neutral-700 { color: #d4d4d4; }
    
    @media print {
      body { font-size: 12pt; }
      .container { padding: 1rem; }
    }
  </style>
</head>
<body class="${isDark ? 'dark' : ''}">
  <div class="container">
    <div class="space-y-12">
      <!-- Header -->
      <header class="text-center space-y-4">
        <h1 class="text-4xl">Atanas Kyurkchiev</h1>
        <p class="text-xl text-neutral-600">Web Developer & Digital Solutions Specialist</p>
        <div class="flex justify-center space-x-6 text-sm">
          <span>me@atanaskyurkchiev.info</span>
          <span>github.com/nnasko</span>
          <span>linkedin.com/in/atanas-kyurkchiev</span>
        </div>
      </header>

      <!-- About -->
      <section class="space-y-4">
        <h2 class="text-2xl border-b">About</h2>
        <p class="leading-relaxed">
          I'm a passionate web developer dedicated to helping businesses succeed in the digital world. 
          With expertise in modern technologies and a client-first approach, I create solutions that not only look great 
          but drive real business results. I believe in building long-term partnerships with my clients.
        </p>
      </section>

      <!-- Experience -->
      <section class="space-y-6">
        <h2 class="text-2xl border-b">Experience</h2>
        
        <div class="space-y-2">
          <div class="flex justify-between items-start">
            <h3 class="text-lg">Developer Lead</h3>
            <span class="text-sm text-neutral-600">2024 - Present</span>
          </div>
          <p class="text-neutral-700" style="font-weight: 500;">Surplush</p>
          <p class="text-sm leading-relaxed">Leading development of a B2B platform connecting businesses with surplus supplies. Built with Next.js, PostgreSQL, and modern web technologies.</p>
        </div>
        
        <div class="space-y-2">
          <div class="flex justify-between items-start">
            <h3 class="text-lg">Founder & Developer</h3>
            <span class="text-sm text-neutral-600">2023 - Present</span>
          </div>
          <p class="text-neutral-700" style="font-weight: 500;">Kronos Clothing</p>
          <p class="text-sm leading-relaxed">Created and maintain a custom e-commerce platform for my clothing brand. Handles inventory, orders, and customer management.</p>
        </div>
      </section>

      <!-- Education -->
      <section class="space-y-6">
        <h2 class="text-2xl border-b">Education</h2>
        
        <div class="space-y-2">
          <div class="flex justify-between items-start">
            <h3 class="text-lg">Software Development</h3>
            <span class="text-sm text-neutral-600">2023 - 2025</span>
          </div>
          <p class="text-neutral-700" style="font-weight: 500;">Access Creative College</p>
          <p class="text-sm leading-relaxed">Comprehensive program covering full-stack development, database design, and software engineering principles.</p>
        </div>
      </section>

      <!-- Skills -->
      <section class="space-y-6">
        <h2 class="text-2xl border-b">Skills</h2>
        <div class="grid-3">
          <div>
            <h3 class="text-lg mb-3">Technical</h3>
            <div class="flex flex-wrap gap-2">
              <span class="skill-tag">JavaScript/TypeScript</span>
              <span class="skill-tag">React</span>
              <span class="skill-tag">Next.js</span>
              <span class="skill-tag">Node.js</span>
              <span class="skill-tag">Python</span>
              <span class="skill-tag">PostgreSQL</span>
              <span class="skill-tag">Prisma</span>
              <span class="skill-tag">Git</span>
              <span class="skill-tag">Docker</span>
              <span class="skill-tag">AWS</span>
            </div>
          </div>
          <div>
            <h3 class="text-lg mb-3">Design</h3>
            <div class="flex flex-wrap gap-2">
              <span class="skill-tag">UI/UX Design</span>
              <span class="skill-tag">Responsive Design</span>
              <span class="skill-tag">Tailwind CSS</span>
              <span class="skill-tag">Figma</span>
              <span class="skill-tag">Adobe Creative Suite</span>
            </div>
          </div>
          <div>
            <h3 class="text-lg mb-3">Soft Skills</h3>
            <div class="flex flex-wrap gap-2">
              <span class="skill-tag">Problem Solving</span>
              <span class="skill-tag">Team Leadership</span>
              <span class="skill-tag">Project Management</span>
              <span class="skill-tag">Communication</span>
              <span class="skill-tag">Adaptability</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</body>
</html>`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const theme = searchParams.get('theme') || 'light';
  
  const html = generateCVHTML(theme);
  
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
} 