const bent = require('bent')
const getJSON = bent('json')
const semverMajor = require('semver/functions/major')
const semverSort = require('semver/functions/sort')
const semverRSort = require('semver/functions/rsort')
const apiUrl = 'https://nodejs.org/dist/index.json'

const getAllDependencies = module.exports.getAllDependencies = async () => {
  try {
    return await getJSON(apiUrl)
  } catch (e) {
    throw new Error(`Failed to get data - ${e.message}`)
  }
}

const getAllSecured = module.exports.getAllSecured = async (versions) => {
  return versions.filter((dependency) => {
    return dependency.security === true
  })
}

module.exports.getLatestSecured = async () => {
  const deps = await getAllDependencies()
  const secured = await getAllSecured(deps)
  const grouped = {}
  const result = {}

  // group by major version
  secured.map((v) => {
    const major = `v${semverMajor(v.version)}`

    if (major in grouped === false) {
      grouped[major] = []
    }

    grouped[major].push(v)
  })

  // get minimum version per major
  for (const major in grouped) {
    const range = grouped[major]

    if (range.length === 1) {
      result[major] = range[0]
    } else {
      const rangeVersionNumbers = []
      const versionReference = {}

      range.map((v) => {
        rangeVersionNumbers.push(v.version)
        versionReference[v.version] = v
      })

      const sorted = semverSort(rangeVersionNumbers)
      result[major] = versionReference[sorted[0]]
    }
  }

  return result
}

module.exports.getLatestRelease = async () => {
  const deps = await getAllDependencies()
  const grouped = {}
  const result = {}

  // group by major version
  deps.map((v) => {
    const major = `v${semverMajor(v.version)}`

    if (major in grouped === false) {
      grouped[major] = []
    }

    grouped[major].push(v)
  })

  // get latest version per major
  for (const major in grouped) {
    const range = grouped[major]

    if (range.length === 1) {
      result[major] = range[0]
    } else {
      const rangeVersionNumbers = []
      const versionReference = {}

      range.map((v) => {
        rangeVersionNumbers.push(v.version)
        versionReference[v.version] = v
      })

      const sorted = semverRSort(rangeVersionNumbers)
      result[major] = versionReference[sorted[0]]
    }
  }

  return result
}
