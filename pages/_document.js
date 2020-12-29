import React from 'react'
import NextDocument, { Html, Head, Main, NextScript } from 'next/document'
import { ServerStyleSheet } from 'styled-components'

export default class Document extends NextDocument {
  static async getInitialProps(ctx) {
    const sheet = new ServerStyleSheet()
    const originalRenderPage = ctx.renderPage

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: App => props => sheet.collectStyles(<App {...props} />),
        })

      const initialProps = await NextDocument.getInitialProps(ctx)
      return {
        ...initialProps,
        styles: (
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>
        ),
      }
    } finally {
      sheet.seal()
    }
  }

  render() {
    return (
      <Html>
        <Head />
        <body>
          <Main />
          <NextScript />
          {process.env.NODE_ENV === 'production' && (
            <script
              dangerouslySetInnerHTML={{
                __html: `
                if (window) {
                  window.onload = function() {
                    if(window.location.hash) {
                      // Reload the page after 2s by removing hash.
                      setTimeout(() => {
                        window.location = window.location.href.substr(0, window.location.href.indexOf('#'))
                      }, 2000)
                    } else {
                      // Send pings to server every 5 seconds.
                      setInterval(() => {
                        window.fetch('/ping')
                      }, 5 * 1000)
                    }
                  }
                }
                `,
              }}
            />
          )}
        </body>
      </Html>
    )
  }
}
