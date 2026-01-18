import { ScrollViewStyleReset } from 'expo-router/html';


export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <ScrollViewStyleReset />

        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const responsiveBackground = `
:root {
  color-scheme: dark;
  background-color: #000000;
}

html,
body,
#root {
  min-height: 100%;
  margin: 0;
  padding: 0;
  background-color: inherit;
}

body {
  color: #ffffff;
}
`;
