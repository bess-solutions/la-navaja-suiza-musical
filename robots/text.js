// Removed wikipedia require
const keywordExtractor = require('keyword-extractor');
const sentenceBoundaryDetection = require('sbd')

const state = require('./state.js')

async function robot() {
  console.log('> [text-robot] Starting...')
  const content = state.load()

  await fetchContentFromWikipedia(content)
  sanitizeContent(content)
  breakContentIntoSentences(content)
  limitMaximumSentences(content)
  await fetchKeywordsOfAllSentences(content)

  state.save(content)

  async function fetchContentFromWikipedia(content) {
    console.log('> [text-robot] Fetching content from Wikipedia')
    try {
      const response = await fetch(`https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(content.searchTerm)}`, {
        headers: {
          'User-Agent': 'VideoMakerBot/1.0 (https://github.com/hebertlima) node-fetch'
        }
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      content.sourceContentOriginal = data.extract || content.searchTerm;
    } catch (error) {
      console.log(`> [text-robot] Error fetching Wikipedia: ${error}`)
      content.sourceContentOriginal = content.searchTerm
    }
    console.log('> [text-robot] Fetching done!')
  }

  function sanitizeContent(content) {
    const withoutBlankLinesAndMarkdown = removeBlankLinesAndMarkdown(content.sourceContentOriginal)
    const withoutDatesInParentheses = removeDatesInParentheses(withoutBlankLinesAndMarkdown)

    content.sourceContentSanitized = withoutDatesInParentheses

    function removeBlankLinesAndMarkdown(text) {
      const allLines = text.split('\n')

      const withoutBlankLinesAndMarkdown = allLines.filter((line) => {
        if (line.trim().length === 0 || line.trim().startsWith('=')) {
          return false
        }

        return true
      })

      return withoutBlankLinesAndMarkdown.join(' ')
    }
  }

  function removeDatesInParentheses(text) {
    return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ')
  }

  function breakContentIntoSentences(content) {
    content.sentences = []

    const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitized)
    sentences.forEach((sentence) => {
      content.sentences.push({
        text: sentence,
        keywords: [],
        images: []
      })
    })
  }

  function limitMaximumSentences(content) {
    content.sentences = content.sentences.slice(0, content.maximumSentences)
  }

  async function fetchKeywordsOfAllSentences(content) {
    console.log('> [text-robot] Starting to fetch keywords from Watson')

    for (const sentence of content.sentences) {
      console.log(`> [text-robot] Sentence: "${sentence.text}"`)

      sentence.keywords = await fetchWatsonAndReturnKeywords(sentence.text)

      console.log(`> [text-robot] Keywords: ${sentence.keywords.join(', ')}\n`)
    }
  }

  async function fetchWatsonAndReturnKeywords(sentence) {
    return new Promise((resolve, reject) => {
      const keywords = keywordExtractor.extract(sentence, {
        language: "english", // default fallback, could be parameterized
        remove_digits: true,
        return_changed_case: true,
        remove_duplicates: true
      });
      // Return top 2-3 keywords to avoid too many generic words
      resolve(keywords.slice(0, 3));
    })
  }

}

module.exports = robot
