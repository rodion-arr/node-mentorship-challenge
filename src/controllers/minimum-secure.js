const { getLatestSecured } = require('../api')

module.exports = async (req, res) => {
  res.json(await getLatestSecured())
}
