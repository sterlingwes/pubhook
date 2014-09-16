var api = require('../_ph/api');

api
.hello
.world()
.success(function(res) {
  console.log(res);
})
.error(function(err) {
  console.error(err);
});