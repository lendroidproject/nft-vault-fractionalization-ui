import React from 'react'
import Head from 'next/head'
import NextApp from 'next/app'
import { ThemeProvider } from 'styled-components'

import { Provider } from 'react-redux'
import withRedux from 'next-redux-wrapper'
import configureStore from 'store'

import Layout from 'layouts'

import 'react-perfect-scrollbar/dist/css/styles.css'

const theme = {
  primary: 'default',
}

class App extends NextApp {
  static async getInitialProps({ Component, ctx }) {
    const pageProps = Component.getInitialProps ? await Component.getInitialProps(ctx) : {}
    return { pageProps }
  }

  render() {
    const {
      props: { Component, pageProps, store },
    } = this

    return (
      <>
        <Head>
          <title>B20</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
          <link href="https://necolas.github.io/normalize.css/latest/normalize.css" rel="stylesheet" type="text/css" />
          <link href="https://fonts.googleapis.com/css2?family=Goldman:wght@400;700&display=swap" rel="stylesheet" />
          <style
            dangerouslySetInnerHTML={{
              __html: `
              :root {
                --font-family: 'Goldman', cursive;
                --color-black: #000000;
                --color-white: #ffffff;
                --color-red: #eb0f0f;
                --color-blue: #4559FC;
                --color-dark-blue: #200AE5;
                --color-pink: #CE1FCA;
                --color-menu: #949394;
                --color-yellow: #fde92a;
                --color-gold: #fff400;
                --color-green: #0BCC1F;
                --color-cyan: #3d9fff;
                --color-light-blue: #413bff;
                --color-grey: #666666;
                --color-dark-grey: #505050;
                --color-border: #bcbcbc;
                --color-border2: #5752fc;
                --color-opacity09: rgba(0,0,0,0.92);
                --box-shadow: 1px 7px 3px 0 rgba(0,0,0,0.5);
                --box-shadow-narrow: 0 2px 4px 0 rgba(0,0,0,0.5);
                --box-shadow-dark: 6px 6px 17px 0 #121120;;
                --linear-gradient1: linear-gradient(180deg, #0038FF 0%, #FF007E 100%);
                --linear-gradient2: linear-gradient(180deg, #FFEAF2 0%, #F1FFFF 100%);
                --color-red1: #ff0006;
              }
              body { font-family: var(--font-family); font-size: 12px; line-height: 15px; color: var(--color-dark-grey); }
              body * { box-sizing: border-box; }
              a, button, .cursor { cursor: pointer; user-select: none; }
              button, input { font-weight: bold; }
              .center { text-align: center; }
              .flex { display: flex; }
              .flex-all { display: flex; flex-direction: column; justify-content: center; align-items: center; }
              .flex-wrap { display: flex; flex-wrap: wrap; }
              .flex-center { display: flex; align-items: center; }
              .flex-column { display: flex; flex-direction: column; }
              .flex-start { display: flex; align-items: flex-start; }
              .flex-end { display: flex; align-items: flex-end; }
              .justify-center { justify-content: center; }
              .justify-between { justify-content: space-between; }
              .justify-around { justify-content: space-around; }
              .relative { position: relative }
              .fill { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
              button { border: none; }
              h1, h2, h3, h4, h5, p { margin-top: 0; margin-bottom: 0px; }
              .uppercase { text-transform: uppercase; }
              .light { font-weight: normal; }
              h1 {
                font-size: 24px;
                line-height: 29px;
                color: var(--color-black);
              }
              h2 {
                font-size: 20px;
                line-height: 24px;
                color: var(--color-black);
              }
              h3 {
                font-size: 16px;
                line-height: 20px;
                color: var(--color-black);
              }
              h4 {
                font-size: 14px;
                line-height: 17px;
                color: var(--color-black);
              }
              p {
                font-size: 14px;
                line-height: 17px;
                color: var(--color-grey);
              }
              a {
                color: var(--color-blue);
              }
              .col-black {
                color: var(--color-black);
              }
              .col-white {
                color: var(--color-white);
              }
              .col-blue {
                color: var(--color-blue);
              }
              .col-dark-blue {
                color: var(--color-dark-blue);
              }
              .col-red {
                color: var(--color-red);
              }
              .col-green {
                color: var(--color-green);
              }
              .col-yellow {
                color: var(--color-yellow);
              }
              .col-pink {
                color: var(--color-pink);
              }
              *::-webkit-scrollbar { width: 5px; }
              *::-webkit-scrollbar-track { background: transparent; }
              *::-webkit-scrollbar-thumb { border-radius: 5px; background-color: var(--color-black); }
              *::-webkit-scrollbar-thumb:hover { background: var(--color-grey); }

              :nth-child(1) { --nth-child: 0 }
              :nth-child(2) { --nth-child: 2 }
              :nth-child(3) { --nth-child: 4 }
              :nth-child(4) { --nth-child: 6 }
              :nth-child(5) { --nth-child: 8 }
              :nth-child(6) { --nth-child: 10 }
              :nth-child(7) { --nth-child: 12 }
            `,
            }}
          />
          <link rel="apple-touch-icon" sizes="57x57" href="/manifest/apple-icon-57x57.png" />
          <link rel="apple-touch-icon" sizes="60x60" href="/manifest/apple-icon-60x60.png" />
          <link rel="apple-touch-icon" sizes="72x72" href="/manifest/apple-icon-72x72.png" />
          <link rel="apple-touch-icon" sizes="76x76" href="/manifest/apple-icon-76x76.png" />
          <link rel="apple-touch-icon" sizes="114x114" href="/manifest/apple-icon-114x114.png" />
          <link rel="apple-touch-icon" sizes="120x120" href="/manifest/apple-icon-120x120.png" />
          <link rel="apple-touch-icon" sizes="144x144" href="/manifest/apple-icon-144x144.png" />
          <link rel="apple-touch-icon" sizes="152x152" href="/manifest/apple-icon-152x152.png" />
          <link rel="apple-touch-icon" sizes="180x180" href="/manifest/apple-icon-180x180.png" />
          <link rel="icon" type="image/png" sizes="192x192" href="/manifest/android-icon-192x192.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/manifest/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="96x96" href="/manifest/favicon-96x96.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/manifest/favicon-16x16.png" />
          <link rel="icon" href="/manifest/favicon.ico" />
          <link rel="manifest" href="/manifest/manifest.json" />
          <meta name="msapplication-TileColor" content="#ffffff" />
          <meta name="msapplication-TileImage" content="/manifest/ms-icon-144x144.png" />
          <meta name="theme-color" content="#ffffff" />
          {process.env.NODE_ENV === 'production' && (
            <script
              dangerouslySetInnerHTML={{
                __html: `(function(w,d,s,l,i){
                  w[l]=w[l]||[];
                  function gtag(){w[l].push(arguments);}
                  gtag('js', new Date());
                  gtag('config', i);
                  var f=d.getElementsByTagName(s)[0];
                  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
                  j.async=true;
                  j.src='https://www.googletagmanager.com/gtag/js?id='+i+dl;
                  f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','G-CEVZQESQGT');`,
              }}
            />
          )}
        </Head>
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </Provider>
        </ThemeProvider>
      </>
    )
  }
}

export function reportWebVitals(metric) {
  // console.info(metric)
}

export default withRedux(configureStore)(App)
