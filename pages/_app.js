import Head from 'next/head';
import '../public/styles/cyberpunk.css'; // 导入我们的自定义赛博朋克样式

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        {/* Tailwind CSS via CDN */}
        <link
          href="https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-M/tailwindcss/2.2.19/tailwind.min.css"
          rel="stylesheet"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>赛博朋克AI早报生成器</title> {/* 你可以更改这里的标题 */}
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp; 