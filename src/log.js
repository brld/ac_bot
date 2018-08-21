const log = options => {
  if (process.env.DEBUG) {
    if (options.onlyVerbose) {
      if (process.env.VERBOSE) {
        console.log(options.message)
      }
    } else {
      console.log(options.message)
    }
  }
}

module.exports = log