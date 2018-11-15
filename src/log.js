const log = args => {
  if (parseInt(process.env.LOG_LEVEL) >= args.logLevel) {
    console.log(args.message)
  }
}

module.exports = log