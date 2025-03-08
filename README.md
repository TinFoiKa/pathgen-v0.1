# Pathgen (For Developers)

## Starter Development Notes

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

alternatively, simply run

``` [terminal]
npm i
```

which will take all packages described in your package.json and install them using npm.

## Basic Development Notes

After you have everything you need to develop set up, it's important to go over the development flow.

