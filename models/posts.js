module.exports = {
  
  pubhookType: 'mongo',
  
  collection: 'posts',
  
  renderEachBy: 'blog/{title}',
  
  sortBy: {
    title: -1
  }
  
};