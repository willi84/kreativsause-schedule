const { NODE_ENV } = process.env;

const routeFilter = (slug,     { listIsSortedBy }) => {
    // in production the home dir is mapped to root
    if (NODE_ENV === 'production' && slug === 'home') {
        slug = '';
      }
  
      let route = slug && slug.length ? `/${slug}/` : '/';
  
      if (listIsSortedBy === 'addedAt') {
        route += 'latest/';
      }
  
      return route;
}
exports.routeFilter = routeFilter;