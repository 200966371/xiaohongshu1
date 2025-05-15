import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="zh-CN">
        <Head>
          {/* Google Fonts */}
          <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Share+Tech+Mono&family=Audiowide&family=Press+Start+2P&family=VT323&family=Roboto+Mono&family=Source+Code+Pro&display=swap" rel="stylesheet" />
          {/* dom-to-image-more script */}
          <script src="https://cdnjs.cloudflare.com/ajax/libs/dom-to-image-more/2.9.6/dom-to-image-more.min.js"></script>
          {/* Tailwind CSS (already linked in your original HTML, ensuring it's here or in _app.js if not using Next.js Tailwind plugin) */}
          {/* For this example, we'll assume Tailwind is set up via Next.js plugin or CDN link is managed elsewhere if needed. 
              If you haven't set up Tailwind with Next.js (e.g., via postcss), 
              you might want to add: <link rel="stylesheet" href="https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-M/tailwindcss/2.2.19/tailwind.min.css" /> 
              However, it's generally better to integrate Tailwind via the official Next.js guide. 
              For now, we focus on fonts and dom-to-image-more as per user's initial HTML structure. */}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument; 