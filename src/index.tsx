import * as React from 'react';
import { renderToString } from 'react-dom/server';

import map from 'lodash/map';
import pickBy from 'lodash/pickBy';

interface Locals {
  path: string;
  assets: {
    [id: string]: string;
  };
  pkg: {
    name: string;
    version: string;
  };
}

export const __esModule = true;

export default ({ assets, pkg }: Locals) => {
  const styles = pickBy(assets, asset => asset.match(/\.css$/)) as { [id: string]: string };
  return renderToString(
    <html lang="en" dir="auto">
      <head>
        <title>{pkg.name}</title>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
        <style>
        {`
          html, body {
            margin: 0;
          }

          * {
            box-sizing: border-box;
          }
        `}
        </style>
        {
          map(styles, (asset, key) => <link key={key} rel="stylesheet" href={asset} />)
        }
      </head>
      <body>
        <div id="container" />
        {
          map(
            [
              assets.common,
              assets.lib,
              assets.bundle,
            ],
            (asset, key) => {
              return <script key={key} src={asset} />;
            }
          )
        }
      </body>
    </html>
  );
};
