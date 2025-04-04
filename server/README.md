## Building the Server

```bash
npm run build
```

## Running the Server

```bash
node index.js
```

## Build Sidecar

```bash
npm run pkg
```

After building, rename the output binary according to your operating system and place it in the `src-tauri/binaries` folder.

Example filenames by platform:

- **Windows**  
  `pyright-server-x86_64-pc-windows-msvc`

- **macOS (Intel)**  
  `pyright-server-x86_64-apple-darwin`

- **macOS (Apple Silicon)**  
  `pyright-server-aarch64-apple-darwin`

- **Linux (x64)**  
  `pyright-server-x86_64-unknown-linux-gnu`
  

This server code is based on a modified version of [erictraut/pyright-playground](https://github.com/erictraut/pyright-playground).