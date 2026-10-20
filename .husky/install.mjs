// Deployment installs may omit development dependencies, including Husky.
// Hooks only belong in local Git checkouts, so leave CI and production installs
// alone before importing the optional development package.
if (process.env.CI || process.env.NODE_ENV === 'production') process.exit(0)

const husky = (await import('husky')).default
console.log(husky())
