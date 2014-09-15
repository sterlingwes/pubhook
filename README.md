# pubhook

Flexible framework for deploying anything from static sites to single page applications.

Inspired by [Webhook](http://webhook.com).

**Note** The API and CLI usage will significantly change after the first 4 goals are achieved, below. The project in its current form is a boilerplate, not an installable module.

### Goals

1.  Handle basic static site rendering based on any database and template engine.
2.  Provide various build hooks that provide full control over data seeding and rendering.
3.  Support single page apps (SPAs) that are search engine crawlable and can bootstrap data and client-side routing from any entry point.
4.  Separate CMS app that triggers builds based on change scope.
5.  Multi-site and i18n friendly.
6.  Easily define REST models & custom server-side endpoints.
7.  Mac, Linux & Windows Friendly with Full Test Coverage

### Progress

Here we'll list progress towards 1.0.

*   _0.1.0_ Handles rendering from markdown files & swig template extensions
*   _0.1.5_ Handles bundling client side modules with webpack
*   _0.1.7_ Handles watch > liveReload for less
*   _0.2.0_ MongoDB adaptor
*   _0.2.5_ Render from database adaptors
*   _0.2.9_ Support for SASS and Web Starter Kit as base styling
*   _0.3.0_ Support for hierarchy for fs-based models & model specific templates
*   _0.3.2_ Server side rendering of Reactjs components

## Usage

1.  Clone this repository `git clone https://github.com/sterlingwes/pubhook.git myproject`
2.  `npm install`
3.  `npm link` (if the ph command doesn't work)
4.  run `ph` from within your project folder to render the site (with `-w` to build changes)

`ph help` to see list of available commands.

## Components

The functionality of pubhook mostly maps to the folder structure outlined below. The `bin` and `core` directories are specific to pubhook and will be part of the separate pubhook module in the near future.

### Apps

Apps are where you break your client side js into modules that are bundled by webpack into one script at render time. Each folder within the apps directory is a separate webpack environment and will be bundled separately. [Read more about webpack](http://webpack.github.io)

Each webpack bundle is output to the `public/scripts/` directory using its hash. See the template section below for more on adding the script tag.

### Assets

The assets folder holds any static assets you want copied to your build at render time. Currently, only `css`, `js`, `png`, `jpg/jpeg`, and `gif` files are copied.

### Markdown

Markdown files in this directory will be rendered using the `base.html` template, and data added to the markdown model using yml front matter. The naming is directly transferable to the public folder: `markdown/about.md` >> `public/about.html`.

### Models

Models are where you will define your model schema and validation rules and form the basis for how rendering is driven from database sources and standard restful endpoints are built for client usage.

You can also define "static" models that are essentially json objects made available to your templates.

Example:

```
module.exports = {
  
  pubhookType: 'mongo',
  
  collection: 'posts',
  
  connection: {
    host: 'localhost',
    port: '27017'
  },
  
  renderEachBy: 'blog/{title}',
  
  sortBy: {
    title: -1
  }
  
};
```

If you omit `pubhookType`, it's assumed your export is a "raw model" in that the object itself would be passed to the views that require it for rendering. See the `models/site.json` example.

For markdown and other file-based model options, you may use `source` to indicate where the files should be found if the name of the folder differs from the name of the model.

### Pages

Similar to the markdown folder, pages allow you to generate pages by extending your templates. The naming is directly transferable to the public folder: `pages/index.html` >> `public/index.html`.

### Templates

At the moment pubhook's templating engine is [swig](paularmstrong.github.io/swig/docs/). At a minimum you require a `partials/base.html` from which pages are rendered.

#### Pubhook-specific template tags

##### get(modelName)

Retrieves model data.

`{% set site = get('site') %}`

##### getAppScript(appName)

Retrieves the script tag for the bundled file corresponding to the appName you pass in (which should match the subfolder of the `apps` directory).

`{{ getAppScript('main') }}`

results in:

`<script src="/scripts/7e7fd8b1de54ec836b57.js"></script>`

## Build Steps / Hooks / Plugins

Coming soon.

## Base Styling

Currently utilizes [Web Starter Kit](http://developers.google.com/web/starter-kit) as a style foundation, with plans to borrow some elements from that build process. The `styleguide.html` inside `/assets` is a good starting point for seeing and tailoring base styles. The modular nature of the SASS file structure makes it easy to cut out the styling you don't need and change / override others.

The plan is to allow for easy drop-in / cloning of existing boilerplate solutions, other than WSK, into pubhook projects in the future. For the most part, the only changes required are fixing path references where builds vary.

## License

MIT