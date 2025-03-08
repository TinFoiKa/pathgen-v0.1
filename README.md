# Basic Development Notes

In order to develop this (preferably in a VS Code environment so that troubleshooting is much easier), please ensure that the following are installed:

- node
- npm (node package manager)
- git

And that you have a github account (which I presume you will)

Then, using node, install the packages detailed in package.json or written in their full names here:

- react
- react-dom
- typescript

And for developer tools,

- gh-pages --save-dev
- vite --save-dev

This should look something like 

``` [terminal]
npm i react
npm i react-dom
npm i typescript
```

With Developer dependencies:

``` [terminal]
npm i gh-pages --save-dev
npm i vite --save-dev
```

'gh-pages' allows for development with github pages, whilst 'vite' allows for development on your localhost
