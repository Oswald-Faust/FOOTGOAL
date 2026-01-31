
// import fs from 'fs';
// import path from 'path';

export function dumpHtml(html: string, filename: string = 'debug-sporty.html') {
  // Client-safe version: Just log length or snippet
  console.log(`[Debug] HTML Dump (${filename}): Length ${html.length}`);
  // console.log(html.substring(0, 500));
}
