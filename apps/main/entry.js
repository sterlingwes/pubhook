var api = require('../_ph/api');

/*
 * GET /api/hello/world and log the result
 */
api
.hello
.world()
.success(function(res) {
  console.log(res);
})
.error(function(err) {
  console.error(err);
});

/*
 * Hook up to the login form if it exists
 * to demonstrate auth built in to CRUD EPs
 */
