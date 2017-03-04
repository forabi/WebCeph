WebCeph
==============

A web app for tracing and [analyzing cephalograms](https://en.wikipedia.org/wiki/Cephalometric_analysis) and photographs used in the planning of [orthodontic treatment](https://en.wikipedia.org/wiki/Orthodontics).

<iframe width="560" height="315" src="https://www.youtube.com/embed/EmNYULKKgLE" frameborder="0" allowfullscreen></iframe>

## Features
### Easy to use
All it takes to start tracing is to drop an image into the app, you do not have to sign up or go through a complicated setup process.

### No installation required
The app is built with web technologies, which means it can be used inside a web browser without having to go through the hassle of installation wizards or figuring out if the app is compatible with your operating system.

### Offline usage
When used for the first time, it is automatically installed and can be used without an Internet connection afterwards.

### Assisted tracing
Choose any of the included analyses and the app steps you through it so you can finish tracing in a few seconds.

### Automatic calculation
Measurements are calculated immediately as you are tracing.

### Automatic interpretation
Measurements are automatically interpreted and used to evaulate and summarize the problems based on each analysis norms.

### You own your data
Images and tracing data never leave your device. All measurements and interpretations are performed locally. Every tracing can be exported and saved on your computer.

### Completely free of charge
No payments, no expiration time, no hidden costs. There is no catch! I made the app to scratch my own itch and decided to share it in the hope it can be useful.

## Development
WebCeph is open source and licensed under [the GNU Public License 3](https://www.gnu.org/licenses/gpl-3.0.en.html).

### Getting started
#### Prerequisites
To get started with the development of WebCeph, you will need a recent version of [Node.js](https://nodejs.org/en/).

Although not required, we also recommend using the [yarn package manager](https://yarnpkg.com/) to install and update dependencies as it enables reproducible builds and avoids a lot of "works on my machine" issues.

Once these are installed, all you need to do is to perform this command:

```
yarn
```

This will fetch and install all the packages required to develop and build the app.

#### Running a development version

To start a local development server, use the following command:

```
yarn run dev
```

This will run a version of the app [locally on port 8080](http://localhost:8080/), the port can be changed by setting the `PORT` environment variable:

```
PORT=5678 yarn run dev
```

The server is configured to hot-reload whenever a source file is changed so you can edit files and see the changes immediately without having to restart the server. This makes development much faster.

After you have made your changes, make sure to modify the tests or add new ones as you see fit.

### Building
Make sure to run the tests with the following command:

```
yarn test:watch
```

Now you can build a production version:

```
yarn run prod
```

## LICENSE
Copyright © 2017  Muhammad Fawwaz Orabi

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
