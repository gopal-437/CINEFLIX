import React from 'react';
import { renderToString } from 'react-dom/server';
import LandingPage from './components/LandingPage';

export const renderPage = () => {
  const html = renderToString(<LandingPage />);
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>My App</title>
      </head>
      <body>
        <div id="root">${html}</div>
        <script src="/client-bundle.js"></script>
      </body>
    </html>
  `;
};