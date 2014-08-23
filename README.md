# pubhook

Inspired by [Webhook](http://webhook.com), but hacker-friendly.

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

*0.1.0* Handles rendering from markdown files swig template extensions

## Usage

1.  Clone this repository `git clone https://github.com/sterlingwes/pubhook.git *myproject*`
2.  `npm install`
3.  `npm link` (if the ph command doesn't work)
4.  run `ph` from within your project folder to render the site

`ph help` to see list of available commands.