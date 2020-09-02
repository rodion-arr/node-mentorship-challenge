const getLocalDependencies = () => {
  return require('../../package.json').dependencies
}

module.exports = async (req, res) => {
  const dependencies = getLocalDependencies()
  res.render('dependencies', {
    deps: dependencies
  })
}
