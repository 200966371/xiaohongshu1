import Head from 'next/head';
// Import global styles, which now include Tailwind directives
import '../styles/globals.css'; 
// Import other custom styles and fonts
import '../styles/cyberpunk.css'; 
import '../styles/apple-notes.css';
import '../styles/card-styles.css';
import '../styles/additional-styles.css';
import '../styles/imported-fonts.css'; 

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>小红书图卡生成工具</title> 
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp; 