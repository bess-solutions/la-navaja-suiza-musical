const { google } = require('googleapis')
const customSearch = google.customsearch('v1')
const credentials = require('./credentials/google-search.json')

async function test() {
  try {
    const response = await customSearch.cse.list({
      auth: credentials.apiKey,
      cx: credentials.searchEngineId,
      q: 'Hip hop',
      searchType: 'image',
      num: 2
    })
    console.log('SUCCESS!')
    console.log(response.data.items[0].link)
  } catch (e) {
    console.log('ERROR:', e.message)
  }
}

test()
