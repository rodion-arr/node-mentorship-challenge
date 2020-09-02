const { getLatestRelease } = require('../api')

module.exports = async (req, res) => {
  const latest = await getLatestRelease()
  res.json(latest)
}
