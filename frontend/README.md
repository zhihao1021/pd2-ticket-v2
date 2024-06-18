# PD2 Ticket System v2 - Frontend


<!-- [English en-US](./README.md) | -->
<!-- [繁體中文 zh-Hans](./README.zh_Hans.md) -->


## About the File Structure
Under `src`, there are following files and folders:

### `index.tsx`
The entry point of whole system. It contains creating root and setting up axios request and response config.

### `App.tsx`
The core of the system. The global function and data are declared and processed here. Besides reading user data from JWT, pop-up message box function and loading page function are also declared here. In addition, the routing path also setting here.

### `views/`
All pages are stored here.

### `schemas/`
All interfaces are defined in here.

### `context/`
There are two React context, `functionContext` store the loading function and pop-up message box function, `userDataContext` store the user data decode from JWT.

### `config/`
Here store the color config, axios config and some page's z-index config.

### `components/`
Components

### `api/`
All function that request resource from server stored here.
