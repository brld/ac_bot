module.exports = text => {
  const regex = RegExp(/(http|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?/).exec(text)

  if (regex) {
    return regex[0]
  } else {
    return null
  }
}